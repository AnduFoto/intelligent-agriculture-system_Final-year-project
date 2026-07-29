import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import { useLocationTree } from '../../hooks/useLocationTree';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ADMIN_TYPE_ZONE = 'ZONE';
const ADMIN_TYPE_SPECIAL_WOREDA = 'SPECIAL_WOREDA';

const STATUS_BADGE = {
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-primary-100 text-primary-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOfficerId, setExpandedOfficerId] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsers = useCallback(() => {
    setIsLoadingUsers(true);
    adminService
      .listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((response) => setUsers(response.data.results || response.data))
      .finally(() => setIsLoadingUsers(false));
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!window.confirm(`Change ${user.email}'s status to ${newStatus}?`)) return;

    try {
      await adminService.updateUserStatus(user.id, newStatus);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    }
  };

  const toggleExpanded = (userId) => {
    setExpandedOfficerId((current) => (current === userId ? null : userId));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Manage Farmer, Officer, and Administrator accounts.</p>
        </div>
        <Button className="w-auto px-4" onClick={() => setShowCreateForm((s) => !s)}>
          {showCreateForm ? 'Cancel' : '+ Create User'}
        </Button>
      </div>

      {showCreateForm && (
        <CreateUserForm
          onSuccess={() => {
            setShowCreateForm(false);
            fetchUsers();
          }}
        />
      )}

      <Card className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={setSearch}
          />
          <SelectField value={roleFilter} onChange={setRoleFilter}>
            <option value="">All Roles</option>
            <option value="FARMER">Farmer</option>
            <option value="OFFICER">Agriculture Officer</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </SelectField>
          <SelectField value={statusFilter} onChange={setStatusFilter}>
            <option value="">All Statuses</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </SelectField>
        </div>
      </Card>

      <Card>
        {isLoadingUsers ? (
          <LoadingSpinner message="Loading users..." />
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <>
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2.5">{u.full_name}</td>
                    <td className="py-2.5 text-gray-500">{u.email}</td>
                    <td className="py-2.5">{u.role}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-1 rounded ${STATUS_BADGE[u.status]}`}>
                        {u.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-3">
                        {u.role === 'OFFICER' && (
                          <button
                            onClick={() => toggleExpanded(u.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {expandedOfficerId === u.id ? 'Hide Kebeles' : 'Manage Kebeles'}
                          </button>
                        )}
                        {u.status !== 'PENDING_VERIFICATION' && (
                          <button
                            onClick={() => handleStatusToggle(u)}
                            className={`text-xs font-medium ${u.status === 'SUSPENDED' ? 'text-primary-600 hover:text-primary-700' : 'text-red-600 hover:text-red-700'}`}
                          >
                            {u.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                     {u.role === 'OFFICER' && (
                          <Link
                            to={`/admin/users/${u.id}/kebeles`}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Manage Kebeles
                          </Link>
                     )}
                </>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------
// Officer Kebele Assignment Panel
// ---------------------------------------------------------------

function OfficerKebelePanel({ officerId }) {
  const [assigned, setAssigned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [kebeleIdInput, setKebeleIdInput] = useState('');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchAssigned = useCallback(() => {
    setIsLoading(true);
    adminService
      .listOfficerKebeles(officerId)
      .then((res) => setAssigned(res.data.assigned_kebeles || []))
      .catch(() => setError('Could not load assigned Kebeles.'))
      .finally(() => setIsLoading(false));
  }, [officerId]);

  useEffect(fetchAssigned, [fetchAssigned]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    const id = parseInt(kebeleIdInput, 10);
    if (!id) {
      setAddError('Enter a valid Kebele ID.');
      return;
    }
    setIsAdding(true);
    try {
      await adminService.assignOfficerKebeles(officerId, [id]);
      setKebeleIdInput('');
      setShowAddForm(false);
      fetchAssigned();
    } catch (err) {
      setAddError(err.response?.data?.detail || err.response?.data?.errors?.kebele_ids?.[0] || 'Failed to assign Kebele.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (kebeleId, kebeleName) => {
    if (!window.confirm(`Remove "${kebeleName}" from this Officer's assigned Kebeles?`)) return;
    try {
      await adminService.removeOfficerKebele(officerId, kebeleId);
      fetchAssigned();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove Kebele.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Assigned Kebeles</h4>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Assign Kebele'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3 items-start">
          <div className="flex-1">
            <input
              value={kebeleIdInput}
              onChange={(e) => setKebeleIdInput(e.target.value)}
              placeholder="Kebele ID (see Location Management for IDs)"
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            />
            {addError && <p className="text-xs text-red-600 mt-1">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="text-xs bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md"
          >
            {isAdding ? '...' : 'Add'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : assigned.length === 0 ? (
        <p className="text-xs text-gray-400">No Kebeles assigned yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {assigned.map((k) => (
            <li key={k.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2 text-sm">
              <span>
                {k.name}{' '}
                <span className="text-gray-400 text-xs">
                  ({k.woreda_name || k.special_woreda_name})
                </span>
              </span>
              <button
                onClick={() => handleRemove(k.id, k.name)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Create User Form (unchanged from previous step)
// ---------------------------------------------------------------

function CreateUserForm({ onSuccess }) {
  const {
    regions,
    isLoading: locationsLoading,
    getZonesForRegion,
    getSpecialWoredasForRegion,
    getWoredasForZone,
    getKebelesForWoreda,
    getKebelesForSpecialWoreda,
  } = useLocationTree();

  const [adminType, setAdminType] = useState(ADMIN_TYPE_ZONE);
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    first_name: '', middle_name: '', last_name: '', email: '', phone_number: '',
    password: '', confirm_password: '', role: 'FARMER',
    region: '', zone: '', woreda: '', special_woreda: '', kebele: '',
    language_preference: 'EN',
  });

  const isOfficer = form.role === 'OFFICER';

  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleRoleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      role: value,
      region: '', zone: '', woreda: '', special_woreda: '', kebele: '',
    }));
  };

  const handleRegionChange = (value) => {
    setForm((prev) => ({ ...prev, region: value, zone: '', woreda: '', special_woreda: '', kebele: '' }));
  };

  const zones = form.region ? getZonesForRegion(form.region) : [];
  const specialWoredas = form.region ? getSpecialWoredasForRegion(form.region) : [];
  const woredas = form.region && form.zone ? getWoredasForZone(form.region, form.zone) : [];

  const kebeles =
    adminType === ADMIN_TYPE_ZONE
      ? (form.region && form.zone && form.woreda
          ? getKebelesForWoreda(form.region, form.zone, form.woreda)
          : [])
      : (form.region && form.special_woreda
          ? getKebelesForSpecialWoreda(form.region, form.special_woreda)
          : []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setMessage('');
    setIsSubmitting(true);

    const payload = isOfficer
      ? {
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          confirm_password: form.confirm_password,
          role: form.role,
          language_preference: form.language_preference,
        }
      : {
          ...form,
          zone: adminType === ADMIN_TYPE_ZONE ? form.zone || null : null,
          woreda: adminType === ADMIN_TYPE_ZONE ? form.woreda || null : null,
          special_woreda: adminType === ADMIN_TYPE_SPECIAL_WOREDA ? form.special_woreda || null : null,
        };

    try {
      const response = await adminService.createUser(payload);
      setMessage(response.data.message);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      setErrors(err.response?.data?.errors || { non_field_errors: [err.response?.data?.detail || 'Creation failed.'] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <h3 className="font-semibold text-gray-800 mb-4">Create New User</h3>

      <Alert variant="success">{message}</Alert>
      <Alert variant="error">{errors?.non_field_errors?.join(' ')}</Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="First Name" value={form.first_name} onChange={set('first_name')} error={errors?.first_name?.[0]} />
          <TextField label="Last Name" value={form.last_name} onChange={set('last_name')} error={errors?.last_name?.[0]} />
        </div>
        <TextField label="Middle Name (optional)" value={form.middle_name} onChange={set('middle_name')} error={errors?.middle_name?.[0]} />
        <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={errors?.email?.[0]} />
        <TextField label="Phone Number" value={form.phone_number} onChange={set('phone_number')} error={errors?.phone_number?.[0]} placeholder="+251912345678" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Password" type="password" value={form.password} onChange={set('password')} error={errors?.password?.[0]} />
          <TextField label="Confirm Password" type="password" value={form.confirm_password} onChange={set('confirm_password')} error={errors?.confirm_password?.[0]} />
        </div>

        <SelectField label="Role" value={form.role} onChange={handleRoleChange} error={errors?.role?.[0]}>
          <option value="FARMER">Farmer</option>
          <option value="OFFICER">Agriculture Officer</option>
          <option value="ADMINISTRATOR">Administrator</option>
        </SelectField>

        {isOfficer ? (
          <Alert variant="info">
            Agriculture Officers have no location assigned at creation. Once this account is
            created, use the Kebele assignment feature to give this Officer visibility into
            one or more Kebeles.
          </Alert>
        ) : (
          <>
            <hr />
            <p className="text-sm font-medium text-gray-700">Location</p>

            {locationsLoading ? (
              <p className="text-sm text-gray-400">Loading location data...</p>
            ) : (
              <>
                <SelectField label="Region" value={form.region} onChange={handleRegionChange} error={errors?.region?.[0]}>
                  <option value="">Select a Region</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </SelectField>

                {form.region && (
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={adminType === ADMIN_TYPE_ZONE}
                        onChange={() => { setAdminType(ADMIN_TYPE_ZONE); setForm((p) => ({ ...p, special_woreda: '', kebele: '' })); }}
                      />
                      Zone / Woreda
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={adminType === ADMIN_TYPE_SPECIAL_WOREDA}
                        onChange={() => { setAdminType(ADMIN_TYPE_SPECIAL_WOREDA); setForm((p) => ({ ...p, zone: '', woreda: '', kebele: '' })); }}
                      />
                      Special Woreda
                    </label>
                  </div>
                )}

                {form.region && adminType === ADMIN_TYPE_ZONE && (
                  <>
                    <SelectField
                      label="Zone"
                      value={form.zone}
                      onChange={(v) => setForm((p) => ({ ...p, zone: v, woreda: '', kebele: '' }))}
                      error={errors?.zone?.[0]}
                    >
                      <option value="">Select a Zone</option>
                      {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </SelectField>
                    {form.zone && (
                      <SelectField
                        label="Woreda"
                        value={form.woreda}
                        onChange={(v) => setForm((p) => ({ ...p, woreda: v, kebele: '' }))}
                        error={errors?.woreda?.[0]}
                      >
                        <option value="">Select a Woreda</option>
                        {woredas.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </SelectField>
                    )}
                  </>
                )}

                {form.region && adminType === ADMIN_TYPE_SPECIAL_WOREDA && (
                  <SelectField
                    label="Special Woreda"
                    value={form.special_woreda}
                    onChange={(v) => setForm((p) => ({ ...p, special_woreda: v, kebele: '' }))}
                    error={errors?.special_woreda?.[0]}
                  >
                    <option value="">Select a Special Woreda</option>
                    {specialWoredas.map((sw) => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
                  </SelectField>
                )}

                {((adminType === ADMIN_TYPE_ZONE && form.woreda) ||
                  (adminType === ADMIN_TYPE_SPECIAL_WOREDA && form.special_woreda)) && (
                  <SelectField label="Kebele" value={form.kebele} onChange={set('kebele')} error={errors?.kebele?.[0]}>
                    <option value="">Select a Kebele</option>
                    {kebeles.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </SelectField>
                )}
              </>
            )}
          </>
        )}

        <Button type="submit" isLoading={isSubmitting} loadingText="Creating...">
          Create User
        </Button>
      </form>
    </Card>
  );
}

export default AdminUserManagementPage;