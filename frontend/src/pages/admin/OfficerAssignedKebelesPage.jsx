import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/adminService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

function OfficerAssignedKebelesPage() {
  const { t } = useTranslation();
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
      .catch((err) => setError(err.response?.data?.detail || t('failed_to_load_officer', 'Could not load this Officer.')))
      .finally(() => setIsLoading(false));
  }, [id, t]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  const officerInitials = officer
    ? (officer.full_name || `${officer.first_name || ''} ${officer.last_name || ''}` || officer.email || 'O')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'O';

  if (isLoading) {
    return (
      <div className="py-24 flex ml-4 flex-col items-center justify-center space-y-4 max-w-5xl mx-auto">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
          {t('loading_officer_assignments', 'Loading officer kebele assignments...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-8">
        <Alert variant="error">{error}</Alert>
        <button
          onClick={() => navigate('/admin/officers')}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_officer_assignments', 'Back to Officer Assignments')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      
      {/* 1. Back button */}
      <div>
        <button
          onClick={() => navigate('/admin/officers')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors py-1 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('back_to_officer_assignments', 'Back to Officer Assignments')}</span>
        </button>
      </div>

      {/* 2. Officer Profile Showcase Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base shadow-sm bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shrink-0">
              {officerInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                  {officer?.first_name} {officer?.last_name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  <ShieldCheck className="w-3 h-3" />
                  {t('role_officer', 'Agriculture Officer')}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  {assigned.length} {assigned.length === 1 ? t('assigned_kebele', 'Kebele Assigned') : t('assigned_kebeles', 'Kebeles Assigned')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                  {officer?.email}
                </span>
                {officer?.phone_number && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                    {officer.phone_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to={`/admin/users/${id}/kebeles/assign`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-primary-600 hover:bg-primary-500 active:scale-95 shadow-sm shadow-primary-500/25 transition-all shrink-0 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>{t('assign_kebele', 'Assign Kebele')}</span>
          </Link>
        </div>
      </div>

      {actionError && (
        <Alert variant="error" className="rounded-xl">
          {actionError}
        </Alert>
      )}

      {/* 3. Assigned Kebeles Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            {t('assigned_operational_kebeles', 'Operational Kebele Coverage')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {assigned.length} {assigned.length === 1 ? t('location_singular', 'location') : t('locations_plural', 'locations')}
          </span>
        </div>

        {assigned.length === 0 ? (
          <Card className="py-16 text-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto mb-3">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              {t('no_assigned_kebeles_officer', 'No Kebeles assigned to this officer yet')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
              {t('assign_first_kebele_hint', 'Assign this officer to their designated Kebele to enable farmer consultations, advisory services, and predictions.')}
            </p>
            <Link
              to={`/admin/users/${id}/kebeles/assign`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-primary-600 hover:bg-primary-500 active:scale-95 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('assign_first_kebele', 'Assign First Kebele')}</span>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {assigned.map((k) => {
              const isDetailOpen = detailKebeleId === k.id;
              const woredaLabel = k.woreda_name || k.special_woreda_name || t('unspecified_woreda', 'Woreda');

              return (
                <div
                  key={k.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/40 font-bold">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800 dark:text-white text-base">
                            {k.name}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
                            {woredaLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500 mt-1 flex-wrap">
                          {k.assigned_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(k.assigned_at).toLocaleDateString()}
                            </span>
                          )}
                          {k.assigned_by_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {t('by', 'by')} {k.assigned_by_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setDetailKebeleId(isDetailOpen ? null : k.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isDetailOpen
                            ? 'bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-white'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{isDetailOpen ? t('hide_team', 'Hide Team') : t('coverage_team', 'Coverage Team')}</span>
                        {isDetailOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isDetailOpen && (
                    <div className="border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-950/40 p-4 sm:p-5">
                      <KebeleDetailPanel
                        kebele={k}
                        currentOfficerId={id}
                        onChanged={fetchAssigned}
                        setActionError={setActionError}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Modern Kebele Detail Panel
// ---------------------------------------------------------------

function KebeleDetailPanel({ kebele, currentOfficerId, onChanged, setActionError }) {
  const { t } = useTranslation();
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
      .catch(() => setError(t('failed_to_load_officers', 'Could not load assigned officers.')))
      .finally(() => setIsLoading(false));
  }, [kebele.id, t]);

  useEffect(() => {
    fetchAssignedOfficers();
  }, [fetchAssignedOfficers]);

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

  const handleRemoveOfficer = async (officerId, officerName) => {
    if (!window.confirm(t('confirm_remove_officer_kebele', {
      name: officerName,
      kebele: kebele.name,
      defaultValue: `Remove ${officerName} from ${kebele.name}?`
    }))) return;

    setError('');
    try {
      await adminService.removeOfficerKebele(officerId, kebele.id);
      fetchAssignedOfficers();
      onChanged();
    } catch (err) {
      setActionError(err.response?.data?.detail || t('failed_to_remove', 'Failed to remove officer.'));
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
      setAssignError(err.response?.data?.detail || t('failed_to_assign', 'Failed to assign officer.'));
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {t('all_officers_assigned_to', { kebele: kebele.name, defaultValue: `All Officers assigned to "${kebele.name}"` })}
        </h4>

        {!showAssignNew && (
          <button
            onClick={openAssignNew}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('assign_another_officer', 'Assign Another Officer')}</span>
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>}

      {isLoading ? (
        <div className="py-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : officers.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-zinc-500 py-2">
          {t('no_officers_assigned_kebele', 'No officers currently assigned to this Kebele.')}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {officers.map((o) => {
            const isThisOfficer = String(o.officer_id) === String(currentOfficerId);
            const officerInitials = (o.officer_name || o.officer_email || 'O')
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={o.officer_id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isThisOfficer
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/60'
                    : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shrink-0">
                      {officerInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800 dark:text-white truncate">
                          {o.officer_name}
                        </span>
                        {isThisOfficer && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                            {t('current', 'Current')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{o.officer_email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveOfficer(o.officer_id, o.officer_name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title={t('remove_from_kebele', 'Remove from this Kebele')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
                  <span>{t('assigned', 'Assigned')} {formatDate(o.assigned_at)}</span>
                  {o.assigned_by_email && (
                    <span className="truncate max-w-[120px]">{t('by', 'by')} {o.assigned_by_email}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Add Another Officer Drawer */}
      {showAssignNew && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
              {t('select_officer_to_assign', 'Select an Officer to Assign to this Kebele')}
            </span>
            <button
              onClick={() => setShowAssignNew(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={officerSearch}
              onChange={(e) => setOfficerSearch(e.target.value)}
              placeholder={t('search_officers', 'Search officers...')}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {assignError && <p className="text-xs text-red-600 dark:text-red-400">{assignError}</p>}

          {isLoadingOfficers ? (
            <div className="py-4 text-center">
              <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-lg max-h-48 overflow-y-auto">
              {visibleOfficers.map((o) => {
                const isAlready = assignedOfficerIds.has(o.id);
                return (
                  <div key={o.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 dark:text-white truncate">{o.full_name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{o.email}</p>
                    </div>

                    {isAlready ? (
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 shrink-0">
                        {t('already_assigned', 'Already assigned')}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAssignNew(o)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 active:scale-95 transition-all shrink-0"
                      >
                        {t('assign', 'Assign')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OfficerAssignedKebelesPage;