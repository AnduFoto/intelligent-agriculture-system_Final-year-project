import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/adminService';
import { useLocationTree } from '../../hooks/useLocationTree';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Sprout, 
  UserCog, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  XCircle,
  X
} from 'lucide-react';

const ADMIN_TYPE_ZONE = 'ZONE';
const ADMIN_TYPE_SPECIAL_WOREDA = 'SPECIAL_WOREDA';

export default function AdminUserManagementPage() {
  const { t } = useTranslation();
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
      .catch((err) => console.error("Failed to load users", err))
      .finally(() => setIsLoadingUsers(false));
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  // Quick stats derived from loaded users
  const stats = useMemo(() => {
    const total = users.length;
    const farmers = users.filter(u => u.role === 'FARMER').length;
    const officers = users.filter(u => u.role === 'OFFICER').length;
    const admins = users.filter(u => u.role === 'ADMINISTRATOR').length;
    return { total, farmers, officers, admins };
  }, [users]);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!window.confirm(t('confirm_status_change', { 
      email: user.email, 
      status: newStatus, 
      defaultValue: `Change ${user.email}'s status to ${newStatus}?` 
    }))) return;

    try {
      await adminService.updateUserStatus(user.id, newStatus);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || t('failed_to_update_status', 'Failed to update status.'));
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(t('confirm_delete_user', { 
      email: user.email, 
      defaultValue: `Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.` 
    }))) return;

    try {
      await adminService.deleteUser(user.id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || t('failed_to_delete_user', 'Failed to delete user.'));
    }
  };

  const toggleExpanded = (userId) => {
    setExpandedOfficerId((current) => (current === userId ? null : userId));
  };

  const hasActiveFilters = Boolean(search || roleFilter || statusFilter);

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6 ml-4 animate-fadeIn max-w-7xl mx-auto">
      
      {/* ========================================================
          1. CLEAN HEADER (Consistent page background, no black hero)
         ======================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-2 border border-primary-200/60 dark:border-primary-800/40">
            <Users className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            {t('user_administration', 'User Administration')}
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('user_management', 'User Management')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('user_management_subtitle', 'Manage Farmer, Officer, and Administrator accounts.')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm((s) => !s)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm active:scale-95 shrink-0 ${
            showCreateForm
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700'
              : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/25'
          }`}
        >
          {showCreateForm ? (
            <>
              <XCircle className="w-4 h-4" />
              {t('cancel', 'Cancel')}
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              {t('create_user', 'Create User')}
            </>
          )}
        </button>
      </div>

      {/* ========================================================
          2. STAT SUMMARY CARDS (Clean theme-matched cards)
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('total_users', 'Total Users')}</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('farmers', 'Farmers')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.farmers}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('officers', 'Officers')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.officers}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t('administrators', 'Admins')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <UserCog className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.admins}</p>
        </div>
      </div>

      {/* ========================================================
          3. CREATE USER FORM (Collapsible)
         ======================================================== */}
      {showCreateForm && (
        <div className="animate-fadeIn">
          <CreateUserForm
            onSuccess={() => {
              setShowCreateForm(false);
              fetchUsers();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* ========================================================
          4. FILTER TOOLBAR
         ======================================================== */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm rounded-2xl">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={t('search_users_placeholder', 'Search by name, email, phone...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role & Status dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <div className="relative min-w-[170px] w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-semibold text-slate-700 dark:text-zinc-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
              >
                <option value="">{t('all_roles', 'All Roles')}</option>
                <option value="FARMER">{t('farmer', 'Farmer')}</option>
                <option value="OFFICER">{t('agriculture_officer', 'Agriculture Officer')}</option>
                <option value="ADMINISTRATOR">{t('administrator', 'Administrator')}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-3 top-3 pointer-events-none" />
            </div>

            <div className="relative min-w-[170px] w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-semibold text-slate-700 dark:text-zinc-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
              >
                <option value="">{t('all_statuses', 'All Statuses')}</option>
                <option value="ACTIVE">{t('active', 'Active')}</option>
                <option value="PENDING_VERIFICATION">{t('pending_verification', 'Pending Verification')}</option>
                <option value="SUSPENDED">{t('suspended', 'Suspended')}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-3 top-3 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shrink-0"
              >
                {t('clear_filters', 'Reset')}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* ========================================================
          5. USER DIRECTORY TABLE
         ======================================================== */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        {isLoadingUsers ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('loading_users', 'Loading users...')}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              {t('no_users_found', 'No users found')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-4">
              {hasActiveFilters 
                ? t('no_users_match_filter', 'No users match your search or filter criteria. Try adjusting filters.') 
                : t('no_users_yet', 'No user accounts exist in the platform yet.')}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t('clear_all_filters', 'Clear All Filters')}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px] text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="px-6 py-4">{t('user', 'User Profile')}</th>
                  <th className="px-6 py-4">{t('role', 'Role')}</th>
                  <th className="px-6 py-4">{t('status', 'Status')}</th>
                  <th className="px-6 py-4">{t('contact', 'Contact')}</th>
                  <th className="px-6 py-4 text-right">{t('action', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {users.map((u) => {
                  const initials = (u.full_name || u.first_name || u.email || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const isExpanded = expandedOfficerId === u.id;

                  return (
                    <React.Fragment key={u.id}>
                      <tr className={`transition-colors duration-150 ${
                        isExpanded 
                          ? 'bg-primary-50/40 dark:bg-primary-950/20' 
                          : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                      }`}>
                        
                        {/* 1. Name & Email Avatar */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shrink-0 ${
                              u.role === 'ADMINISTRATOR'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                                : u.role === 'OFFICER'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                            }`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate">
                                {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || t('unnamed_user', 'Unnamed User')}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                <span className="truncate">{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.role === 'ADMINISTRATOR' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                              <UserCog className="w-3.5 h-3.5" />
                              {t('role_ADMINISTRATOR', 'Administrator')}
                            </span>
                          ) : u.role === 'OFFICER' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {t('role_OFFICER', 'Agriculture Officer')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              <Sprout className="w-3.5 h-3.5" />
                              {t('role_FARMER', 'Farmer')}
                            </span>
                          )}
                        </td>

                        {/* 3. Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {t('status_ACTIVE', 'Active')}
                            </span>
                          ) : u.status === 'SUSPENDED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              {t('status_SUSPENDED', 'Suspended')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {t('status_PENDING_VERIFICATION', 'Pending Verification')}
                            </span>
                          )}
                        </td>

                        {/* 4. Phone Number */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-zinc-400">
                          {u.phone_number ? (
                            <span className="inline-flex items-center gap-1 font-medium font-mono text-slate-600 dark:text-zinc-300">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {u.phone_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-600 italic">—</span>
                          )}
                        </td>

                        {/* 5. Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex justify-end items-center gap-2">
                            
                            {/* Officer Kebele Expansion Toggle */}
                            {u.role === 'OFFICER' && (
                              <button
                                onClick={() => toggleExpanded(u.id)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
                                  isExpanded
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800/40'
                                }`}
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                {isExpanded ? t('hide_kebeles', 'Hide Kebeles') : t('manage_kebeles', 'Manage Kebeles')}
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}

                            {/* Suspend / Reactivate */}
                            {u.status !== 'PENDING_VERIFICATION' && (
                              <button
                                onClick={() => handleStatusToggle(u)}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                                  u.status === 'SUSPENDED'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40'
                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/40'
                                }`}
                              >
                                {u.status === 'SUSPENDED' ? t('reactivate', 'Reactivate') : t('suspend', 'Suspend')}
                              </button>
                            )}

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title={t('delete', 'Delete')}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Officer Kebele Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-zinc-950/40">
                          <td colSpan="5" className="px-6 py-4 border-t-0">
                            <OfficerKebelePanel officerId={u.id} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ========================================================
// SUB-COMPONENT: OfficerKebelePanel (Clean & Modern Drawer)
// ========================================================
function OfficerKebelePanel({ officerId }) {
  const { t } = useTranslation();
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
      .catch(() => setError(t('failed_load_kebeles', 'Could not load assigned Kebeles.')))
      .finally(() => setIsLoading(false));
  }, [officerId, t]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    const id = parseInt(kebeleIdInput, 10);
    if (!id) {
      setAddError(t('invalid_kebele_id', 'Enter a valid Kebele ID.'));
      return;
    }
    setIsAdding(true);
    try {
      await adminService.assignOfficerKebeles(officerId, [id]);
      setKebeleIdInput('');
      setShowAddForm(false);
      fetchAssigned();
    } catch (err) {
      setAddError(err.response?.data?.detail || err.response?.data?.errors?.kebele_ids?.[0] || t('failed_assign_kebele', 'Failed to assign Kebele.'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (kebeleId, kebeleName) => {
    if (!window.confirm(t('confirm_remove_kebele', { name: kebeleName, defaultValue: `Remove "${kebeleName}" from this Officer's assigned Kebeles?` }))) return;
    try {
      await adminService.removeOfficerKebele(officerId, kebeleId);
      fetchAssigned();
    } catch (err) {
      alert(err.response?.data?.detail || t('failed_remove_kebele', 'Failed to remove Kebele.'));
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">
              {t('assigned_kebeles', 'Assigned Kebeles')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {assigned.length} {t('kebeles_assigned_count', 'Kebele(s) assigned to this officer')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800/40 transition-colors"
        >
          {showAddForm ? t('cancel', 'Cancel') : `+ ${t('assign_kebele', 'Assign Kebele')}`}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="flex gap-2 items-start bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
          <div className="flex-1">
            <input
              value={kebeleIdInput}
              onChange={(e) => setKebeleIdInput(e.target.value)}
              placeholder={t('kebele_id_placeholder', 'Kebele ID (see Location Management)')}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-medium transition-all"
            />
            {addError && <p className="text-xs font-semibold text-red-500 dark:text-red-400 mt-1">{addError}</p>}
          </div>
          <Button type="submit" size="sm" isLoading={isAdding} loadingText="...">
            {t('add', 'Add')}
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="py-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          {t('loading', 'Loading...')}
        </div>
      ) : error ? (
        <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl">{error}</p>
      ) : assigned.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-zinc-400 italic">
            {t('no_kebeles_assigned', 'No Kebeles assigned yet.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {assigned.map((k) => (
            <div 
              key={k.id} 
              className="flex items-center justify-between bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-3 text-xs transition-colors hover:border-primary-300 dark:hover:border-primary-900/50 group"
            >
              <div className="min-w-0 pr-2">
                <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">{k.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                  {k.woreda_name || k.special_woreda_name || t('kebele', 'Kebele')}
                </p>
              </div>
              <button
                onClick={() => handleRemove(k.id, k.name)}
                title={t('remove', 'Remove')}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-lg transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================================
// SUB-COMPONENT: CreateUserForm (Clean & Modern Form Card)
// ========================================================
function CreateUserForm({ onSuccess, onCancel }) {
  const { t } = useTranslation();
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

    const payload = {
      ...form,
      zone: adminType === ADMIN_TYPE_ZONE ? form.zone || null : null,
      woreda: adminType === ADMIN_TYPE_ZONE ? form.woreda || null : null,
      special_woreda: adminType === ADMIN_TYPE_SPECIAL_WOREDA ? form.special_woreda || null : null,
      kebele: isOfficer ? null : form.kebele || null,
    };

    try {
      const response = await adminService.createUser(payload);
      setMessage(response.data.message);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      setErrors(err.response?.data?.errors || { non_field_errors: [err.response?.data?.detail || t('creation_failed', 'Creation failed.')] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            {t('create_new_user', 'Create New User')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('create_user_desc', 'Fill in the details below to add a new user to the system.')}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold p-2"
        >
          ✕
        </button>
      </div>

      {message && <Alert variant="success" className="my-6">{message}</Alert>}
      {errors?.non_field_errors && <Alert variant="error" className="my-6">{errors.non_field_errors.join(' ')}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        
        {/* ========================================================
            STEP 1: PERSONAL DETAILS
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-200 dark:border-primary-800">1</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              {t('personal_details', 'Personal Details')}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('first_name', 'First Name')} value={form.first_name} onChange={set('first_name')} error={errors?.first_name?.[0]} required />
            <TextField label={t('last_name', 'Last Name')} value={form.last_name} onChange={set('last_name')} error={errors?.last_name?.[0]} required />
          </div>
          
          <TextField label={t('middle_name', 'Middle Name (optional)')} value={form.middle_name} onChange={set('middle_name')} error={errors?.middle_name?.[0]} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('email', 'Email Address')} type="email" value={form.email} onChange={set('email')} error={errors?.email?.[0]} required />
            <TextField label={t('phone_number', 'Phone Number')} value={form.phone_number} onChange={set('phone_number')} error={errors?.phone_number?.[0]} placeholder="+251912345678" />
          </div>
        </div>

        {/* ========================================================
            STEP 2: SECURITY & ROLE SELECTION
           ======================================================== */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-200 dark:border-primary-800">2</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              {t('security_role', 'Security & Role')}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('password', 'Password')} type="password" value={form.password} onChange={set('password')} error={errors?.password?.[0]} required />
            <TextField label={t('confirm_password', 'Confirm Password')} type="password" value={form.confirm_password} onChange={set('confirm_password')} error={errors?.confirm_password?.[0]} required />
          </div>

          {/* Interactive Role Card Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider block">
              {t('select_account_role', 'Account Role')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: 'FARMER', 
                  title: t('farmer', 'Farmer'), 
                  desc: t('farmer_role_desc', 'Crop monitoring, disease detection & advice'),
                  icon: Sprout,
                  activeColor: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                },
                { 
                  id: 'OFFICER', 
                  title: t('agriculture_officer', 'Agriculture Officer'), 
                  desc: t('officer_role_desc', 'Kebele management, advisory & consultations'),
                  icon: ShieldCheck,
                  activeColor: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300'
                },
                { 
                  id: 'ADMINISTRATOR', 
                  title: t('administrator', 'Administrator'), 
                  desc: t('admin_role_desc', 'Platform oversight, users & locations'),
                  icon: UserCog,
                  activeColor: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300'
                },
              ].map((r) => {
                const isSelected = form.role === r.id;
                const IconComponent = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? `${r.activeColor} ring-1 ring-primary-500/30 font-semibold shadow-sm`
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 hover:bg-slate-100/70 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="w-5 h-5 shrink-0" />
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                    </div>
                    <p className="font-bold text-sm">{r.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">{r.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors?.role?.[0] && <p className="text-xs font-semibold text-red-500">{errors.role[0]}</p>}
          </div>
        </div>

        {/* ========================================================
            STEP 3: GEOGRAPHIC ASSIGNMENT
           ======================================================== */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-200 dark:border-primary-800">3</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              {t('geographic_location', 'Geographic Location')}
            </h4>
          </div>

          {isOfficer && (
            <Alert variant="info">
              {t('officer_location_notice', 'For Agriculture Officers, select their primary location up to the Woreda level. Kebele assignments are managed separately after the account is created.')}
            </Alert>
          )}

          {locationsLoading ? (
            <div className="py-4 flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              {t('loading_locations', 'Loading location data...')}
            </div>
          ) : (
            <div className="space-y-4 bg-slate-50/70 dark:bg-zinc-950/60 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              
              <SelectField label={t('region', 'Region')} value={form.region} onChange={handleRegionChange} error={errors?.region?.[0]}>
                <option value="">{t('select_region', 'Select a Region')}</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </SelectField>

              {form.region && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider block">
                    {t('admin_unit_type', 'Administrative Unit Type')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 max-w-sm">
                    <button
                      type="button"
                      onClick={() => { setAdminType(ADMIN_TYPE_ZONE); setForm((p) => ({ ...p, special_woreda: '', kebele: '' })); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        adminType === ADMIN_TYPE_ZONE
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {t('zone_woreda', 'Zone / Woreda')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdminType(ADMIN_TYPE_SPECIAL_WOREDA); setForm((p) => ({ ...p, zone: '', woreda: '', kebele: '' })); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        adminType === ADMIN_TYPE_SPECIAL_WOREDA
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {t('special_woreda', 'Special Woreda')}
                    </button>
                  </div>
                </div>
              )}

              {form.region && adminType === ADMIN_TYPE_ZONE && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label={t('zone', 'Zone')}
                    value={form.zone}
                    onChange={(v) => setForm((p) => ({ ...p, zone: v, woreda: '', kebele: '' }))}
                    error={errors?.zone?.[0]}
                  >
                    <option value="">{t('select_zone', 'Select a Zone')}</option>
                    {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </SelectField>
                  
                  {form.zone && (
                    <SelectField
                      label={t('woreda', 'Woreda')}
                      value={form.woreda}
                      onChange={(v) => setForm((p) => ({ ...p, woreda: v, kebele: '' }))}
                      error={errors?.woreda?.[0]}
                    >
                      <option value="">{t('select_woreda', 'Select a Woreda')}</option>
                      {woredas.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </SelectField>
                  )}
                </div>
              )}

              {form.region && adminType === ADMIN_TYPE_SPECIAL_WOREDA && (
                <SelectField
                  label={t('special_woreda', 'Special Woreda')}
                  value={form.special_woreda}
                  onChange={(v) => setForm((p) => ({ ...p, special_woreda: v, kebele: '' }))}
                  error={errors?.special_woreda?.[0]}
                >
                  <option value="">{t('select_special_woreda', 'Select a Special Woreda')}</option>
                  {specialWoredas.map((sw) => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
                </SelectField>
              )}

              {((adminType === ADMIN_TYPE_ZONE && form.woreda) ||
                (adminType === ADMIN_TYPE_SPECIAL_WOREDA && form.special_woreda)) && !isOfficer && (
                <SelectField label={t('kebele', 'Kebele')} value={form.kebele} onChange={set('kebele')} error={errors?.kebele?.[0]}>
                  <option value="">{t('select_kebele', 'Select a Kebele')}</option>
                  {kebeles.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                </SelectField>
              )}
            </div>
          )}
        </div>

        {/* Submit action buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting} 
            loadingText={t('creating', 'Creating...')} 
            className="px-6 bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-500/20 py-2.5 rounded-xl font-bold"
          >
            {t('create_user', 'Create User')}
          </Button>
        </div>
      </form>
    </Card>
  );
}