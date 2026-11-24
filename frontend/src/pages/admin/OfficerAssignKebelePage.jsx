import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/adminService';
import { locationAdminService } from '../../api/locationAdminService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Check,
  X
} from 'lucide-react';

function OfficerAssignKebelePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [officer, setOfficer] = useState(null);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [allKebeles, setAllKebeles] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isAssigningId, setIsAssigningId] = useState(null);

  const fetchOfficer = useCallback(() => {
    setIsLoading(true);
    setError('');
    adminService
      .listOfficerKebeles(id)
      .then((res) => {
        setOfficer(res.data);
        setAssignedIds(new Set((res.data.assigned_kebeles || []).map((k) => k.id)));
      })
      .catch((err) => setError(err.response?.data?.detail || t('failed_to_load_officer', 'Could not load this Officer.')))
      .finally(() => setIsLoading(false));
  }, [id, t]);

  const fetchAllKebeles = useCallback(() => {
    setIsLoadingAll(true);
    locationAdminService
      .searchKebeles('')
      .then((res) => setAllKebeles(res.data.results || res.data))
      .catch(() => setAllKebeles([]))
      .finally(() => setIsLoadingAll(false));
  }, []);

  useEffect(() => {
    fetchOfficer();
  }, [fetchOfficer]);

  useEffect(() => {
    fetchAllKebeles();
  }, [fetchAllKebeles]);

  const visibleKebeles = useMemo(() => {
    if (!searchTerm.trim()) return allKebeles;
    const term = searchTerm.trim().toLowerCase();
    return allKebeles.filter((k) => {
      const nameMatch = k.name.toLowerCase().includes(term);
      const woredaMatch = (k.woreda_name || k.special_woreda_name || '').toLowerCase().includes(term);
      return nameMatch || woredaMatch;
    });
  }, [allKebeles, searchTerm]);

  const handleAssign = async (kebele) => {
    setActionError('');
    setActionMessage('');
    setIsAssigningId(kebele.id);
    try {
      await adminService.assignOfficerKebeles(id, [kebele.id]);
      setActionMessage(t('kebele_assigned_success', { 
        name: kebele.name, 
        defaultValue: `"${kebele.name}" assigned successfully.` 
      }));
      setAssignedIds((prev) => new Set([...prev, kebele.id]));
      fetchOfficer();
    } catch (err) {
      setActionError(err.response?.data?.detail || t('failed_to_assign_kebele', 'Failed to assign Kebele.'));
    } finally {
      setIsAssigningId(null);
    }
  };

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
      <div className="py-24 ml-4 flex flex-col items-center justify-center space-y-4 max-w-4xl mx-auto">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
          {t('loading_officer_info', 'Loading Officer information...')}
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
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      
      {/* 1. Back button */}
      <div>
        <button
          onClick={() => navigate(`/admin/users/${id}/kebeles`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors py-1 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('back_to_assigned_kebeles', 'Back to Assigned Kebeles')}</span>
        </button>
      </div>

      {/* 2. Officer Summary Banner Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shrink-0">
              {officerInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
                  {officer?.first_name} {officer?.last_name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  {t('role_officer', 'Officer')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{officer?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {assignedIds.size} {assignedIds.size === 1 ? t('kebele_assigned', 'Kebele Assigned') : t('kebeles_assigned', 'Kebeles Assigned')}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {actionMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-sm font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-200 text-sm font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-red-600 hover:text-red-800 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Kebele Directory Selection */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {t('select_kebele_to_assign', 'Select Kebele to Assign')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('showing_kebeles_count', { 
                  count: visibleKebeles.length, 
                  total: allKebeles.length, 
                  defaultValue: `Showing ${visibleKebeles.length} of ${allKebeles.length} available Kebeles` 
                })}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_kebele_or_woreda', 'Search kebele or woreda...')}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoadingAll ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-7 h-7 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {t('loading_kebeles', 'Loading kebeles...')}
            </p>
          </div>
        ) : visibleKebeles.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
              {searchTerm 
                ? t('no_kebeles_matching_search', { search: searchTerm, defaultValue: `No Kebeles found matching "${searchTerm}".` }) 
                : t('no_kebeles_exist', 'No Kebeles exist in the database yet.')}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 mt-2"
              >
                {t('clear_search', 'Clear search filter')}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-[32rem] overflow-y-auto">
            {visibleKebeles.map((k) => {
              const isAssigned = assignedIds.has(k.id);
              const isAssigningThis = isAssigningId === k.id;
              const woredaLabel = k.woreda_name || k.special_woreda_name;

              return (
                <div
                  key={k.id}
                  className="p-3.5 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isAssigned 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40' 
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200/60 dark:border-zinc-700/60'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">
                          {k.name}
                        </span>
                        {woredaLabel && (
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60">
                            {woredaLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        ID: #{k.id}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isAssigned ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('assigned', 'Assigned')}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAssign(k)}
                        disabled={isAssigningThis}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 active:scale-95 disabled:opacity-50 transition-all shadow-xs"
                      >
                        {isAssigningThis ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{t('assign_kebele', 'Assign')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default OfficerAssignKebelePage;