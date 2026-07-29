import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function OfficerAssignedKebelesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [officer, setOfficer] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [detailKebeleId, setDetailKebeleId] = useState(null);

  const fetchAssigned = useCallback(() => {
    setIsLoading(true);
    setError('');
    adminService
      .listOfficerKebeles(id)
      .then((res) => {
        setOfficer(res.data);
        setAssigned(res.data.assigned_kebeles || []);
      })
      .catch((err) => setError(err.response?.data?.detail || 'Could not load this Officer.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(fetchAssigned, [fetchAssigned]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading Officer..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate('/admin/users')} className="text-sm text-primary-600 hover:text-primary-700">
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/admin/users')} className="text-sm text-primary-600 hover:text-primary-700 mb-4">
        ← Back to Users
      </button>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-gray-800">Assigned Kebeles</h1>
        <Link
          to={`/admin/users/${id}/kebeles/assign`}
          className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md font-medium"
        >
          + Assign Kebele
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {officer?.first_name} {officer?.last_name} — {officer?.email}
      </p>

      <Alert variant="error">{actionError}</Alert>

      <Card>
        {assigned.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">No Kebeles assigned yet.</p>
            <Link
              to={`/admin/users/${id}/kebeles/assign`}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Assign the first Kebele →
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {assigned.map((k) => (
              <li key={k.id}>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-sm text-gray-800">
                    {k.name}{' '}
                    <span className="text-gray-400 text-xs">
                      ({k.woreda_name || k.special_woreda_name})
                    </span>
                  </span>
                  <button
                    onClick={() => setDetailKebeleId(detailKebeleId === k.id ? null : k.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {detailKebeleId === k.id ? 'Hide Detail' : 'Detail'}
                  </button>
                </div>
                {detailKebeleId === k.id && (
                  <KebeleDetailPanel
                    kebele={k}
                    currentOfficerId={id}
                    onChanged={fetchAssigned}
                    setActionError={setActionError}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------
// Kebele Detail Panel — every Officer assigned to this Kebele,
// with when/by whom, remove per-officer, reassign to another.
// ---------------------------------------------------------------

function KebeleDetailPanel({ kebele, currentOfficerId, onChanged, setActionError }) {
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAssignNew, setShowAssignNew] = useState(false);
  const [allOfficers, setAllOfficers] = useState([]);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [officerSearch, setOfficerSearch] = useState('');
  const [assignError, setAssignError] = useState('');

  const fetchAssignedOfficers = useCallback(() => {
    setIsLoading(true);
    adminService
      .getKebeleOfficers(kebele.id)
      .then((res) => setOfficers(res.data))
      .catch(() => setError('Could not load assigned officers.'))
      .finally(() => setIsLoading(false));
  }, [kebele.id]);

  useEffect(fetchAssignedOfficers, [fetchAssignedOfficers]);

  const openAssignNew = () => {
    setShowAssignNew(true);
    setIsLoadingOfficers(true);
    adminService
      .listUsers({ role: 'OFFICER' })
      .then((res) => setAllOfficers(res.data.results || res.data))
      .catch(() => setAllOfficers([]))
      .finally(() => setIsLoadingOfficers(false));
  };

  const assignedOfficerIds = new Set(officers.map((o) => o.officer_id));

  const visibleOfficers = allOfficers.filter((o) => {
    if (!officerSearch.trim()) return true;
    const term = officerSearch.trim().toLowerCase();
    return (o.full_name || '').toLowerCase().includes(term) || o.email.toLowerCase().includes(term);
  });

  const handleRemoveOfficer = async (officerId) => {
    if (!window.confirm('Remove this Officer from the Kebele?')) return;
    setError('');
    try {
      await adminService.removeOfficerKebele(officerId, kebele.id);
      fetchAssignedOfficers();
      onChanged();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to remove.');
    }
  };

  const handleAssignNew = async (officer) => {
    setAssignError('');
    try {
      await adminService.assignOfficerKebeles(officer.id, [kebele.id]);
      setShowAssignNew(false);
      fetchAssignedOfficers();
      onChanged();
    } catch (err) {
      setAssignError(err.response?.data?.detail || 'Failed to assign.');
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3 ml-2">
      <p className="text-xs font-semibold text-gray-600 mb-2">
        Officers assigned to "{kebele.name}"
      </p>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {isLoading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : officers.length === 0 ? (
        <p className="text-xs text-gray-400 mb-2">No officers currently assigned.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {officers.map((o) => (
            <li key={o.officer_id} className="bg-white border border-gray-200 rounded-md px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">
                  {o.officer_name}{' '}
                  {String(o.officer_id) === String(currentOfficerId) && (
                    <span className="text-primary-600">(this officer)</span>
                  )}
                </span>
                <button
                  onClick={() => handleRemoveOfficer(o.officer_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <p className="text-gray-500">{o.officer_email}</p>
              <p className="text-gray-400 mt-1">
                Assigned {formatDate(o.assigned_at)}
                {o.assigned_by_email && ` by ${o.assigned_by_email}`}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!showAssignNew ? (
        <button
          onClick={openAssignNew}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          + Assign to another Officer
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Select an Officer</span>
            <button onClick={() => setShowAssignNew(false)} className="text-xs text-gray-500">
              Cancel
            </button>
          </div>
          <input
            value={officerSearch}
            onChange={(e) => setOfficerSearch(e.target.value)}
            placeholder="Search officers..."
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs mb-2"
          />
          {assignError && <p className="text-xs text-red-600 mb-2">{assignError}</p>}
          {isLoadingOfficers ? (
            <p className="text-xs text-gray-400">Loading officers...</p>
          ) : (
            <ul className="divide-y border border-gray-200 rounded-md bg-white max-h-48 overflow-y-auto">
              {visibleOfficers.map((o) => (
                <li key={o.id} className="px-3 py-1.5 flex items-center justify-between text-xs">
                  <span>{o.full_name} <span className="text-gray-400">({o.email})</span></span>
                  {assignedOfficerIds.has(o.id) ? (
                    <span className="text-gray-400">Already assigned</span>
                  ) : (
                    <button
                      onClick={() => handleAssignNew(o)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Assign
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default OfficerAssignedKebelesPage;