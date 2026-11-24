import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import leadOfficerService from '../../api/leadOfficerService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  Users, 
  Trash2, 
  UserCheck, 
  Mail, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function AdminLeadOfficerPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [kebeles, setKebeles] = useState([]);
  const [selectedKebele, setSelectedKebele] = useState(null);

  const [officers, setOfficers] = useState([]);
  const [leadOfficer, setLeadOfficer] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  const [loadingKebeles, setLoadingKebeles] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all Kebeles on mount, and re-fetch (filtered) whenever search changes.
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoadingKebeles(true);
      try {
        const data = await leadOfficerService.searchKebeles(search.trim());
        setKebeles(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(t('failed_load_kebeles', 'Failed to load Kebeles.'));
      } finally {
        setLoadingKebeles(false);
      }
    }, search.trim() === '' ? 0 : 300);

    return () => clearTimeout(timeout);
  }, [search, t]);

  const loadKebeleDetail = async (kebele) => {
    setSelectedKebele(kebele);
    setError('');
    setSuccess('');
    setSelectedOfficerId('');
    setLoadingDetail(true);
    try {
      const [officersData, leadData] = await Promise.all([
        leadOfficerService.getKebeleOfficers(kebele.id),
        leadOfficerService.getLeadOfficer(kebele.id),
      ]);
      setOfficers(officersData || []);
      setLeadOfficer(leadData.lead_officer || null);
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_load_kebele_details', 'Failed to load Kebele details.'));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOfficerId) {
      setError(t('please_select_officer_designate', 'Please select an officer to designate as Lead Officer.'));
      return;
    }
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await leadOfficerService.assignLeadOfficer(
        selectedKebele.id,
        Number(selectedOfficerId)
      );
      setLeadOfficer(data);
      setSuccess(t('is_now_lead_officer', { officerName: data.officer_full_name, kebeleName: selectedKebele.name, defaultValue: `${data.officer_full_name} is now the Lead Officer for ${selectedKebele.name}.` }));
      setSelectedOfficerId('');
    } catch (err) {
      const errors = err.response?.data?.errors;
      const detail = err.response?.data?.detail;
      const message =
        (errors && Object.values(errors).flat().join(' ')) ||
        detail ||
        t('failed_assign_lead_officer', 'Failed to assign Lead Officer.');
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(t('confirm_remove_lead_officer', { name: leadOfficer?.officer_full_name, defaultValue: `Remove Lead Officer designation for ${leadOfficer?.officer_full_name}?` }))) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await leadOfficerService.removeLeadOfficer(selectedKebele.id);
      setLeadOfficer(null);
      setSuccess(t('lead_officer_removed_success', 'Lead Officer designation removed.'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_remove_lead_officer', 'Failed to remove Lead Officer.'));
    } finally {
      setActionLoading(false);
    }
  };

  const leadInitials = leadOfficer
    ? (leadOfficer.officer_full_name || leadOfficer.officer_email || 'L')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'L';

  return (
    <div className="space-y-6 ml-4 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200/60 dark:border-blue-800/40">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {t('leadership_assignments', 'Leadership Assignments')}
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('lead_officer_management', 'Lead Officer Management')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('lead_officer_subtitle', 'Designate and maintain the Lead Agriculture Officer for each Kebele.')}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="error" className="rounded-xl">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="rounded-xl">
          {success}
        </Alert>
      )}

      {/* 2. Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Kebele Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              {t('step_select_kebele', '1. Select a Kebele')}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {kebeles.length}
            </span>
          </div>

          <Card className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_kebele_placeholder', 'Search Kebele by name...')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
              />
            </div>

            {loadingKebeles ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">{t('loading_kebeles', 'Loading kebeles...')}</p>
              </div>
            ) : kebeles.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-8 italic">
                {t('no_kebeles_found', 'No Kebeles found.')}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-[30rem] overflow-y-auto pr-1">
                {kebeles.map((k) => {
                  const isSelected = selectedKebele?.id === k.id;
                  const woredaText = k.woreda_name || k.special_woreda_name;

                  return (
                    <button
                      key={k.id}
                      onClick={() => loadKebeleDetail(k)}
                      type="button"
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between my-1 ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/50 shadow-xs'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-800 dark:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-white'}`}>
                          {k.name}
                        </p>
                        {woredaText && (
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                            {woredaText}
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-primary-600 dark:text-primary-400 translate-x-0.5' : 'text-slate-300 dark:text-zinc-600'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Kebele Leadership & Officer Assignment (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              {t('step_officer_assignment', '2. Leadership & Coverage Team')}
            </h2>
          </div>

          {!selectedKebele ? (
            <Card className="py-20 text-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto mb-3">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                {t('no_kebele_selected', 'No Kebele selected')}
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
                {t('select_kebele_to_view_lead', 'Select a Kebele from the left list to view or designate its Lead Officer and inspect assigned personnel.')}
              </p>
            </Card>
          ) : loadingDetail ? (
            <Card className="py-20 text-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {t('loading_kebele_leadership', 'Loading Kebele leadership details...')}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              
              {/* Selected Kebele Header */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-800 dark:text-white">
                        {selectedKebele.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {selectedKebele.woreda_name || selectedKebele.special_woreda_name || t('kebele_jurisdiction', 'Kebele Jurisdiction')}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    {officers.length} {officers.length === 1 ? t('assigned_officer', 'Assigned Officer') : t('assigned_officers', 'Assigned Officers')}
                  </span>
                </div>
              </div>

              {/* Current Lead Officer Card */}
              <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {t('current_lead_officer', 'Current Lead Officer')}
                  </h4>
                  {leadOfficer && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      {t('active_lead', 'Active Lead')}
                    </span>
                  )}
                </div>

                {leadOfficer ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/50">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm border border-blue-200 dark:border-blue-800/50 shrink-0">
                        {leadInitials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                          {leadOfficer.officer_full_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {leadOfficer.officer_email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleRemove}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50 transition-colors disabled:opacity-50 self-end sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('remove_designation', 'Remove')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 italic">
                      {t('no_lead_officer_yet', 'No Lead Officer designated yet for this Kebele.')}
                    </p>
                  </div>
                )}
              </Card>

              {/* Designate Lead Officer Form */}
              <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  {leadOfficer ? t('reassign_lead_officer', 'Reassign / Replace Lead Officer') : t('designate_lead_officer', 'Designate Lead Officer')}
                </h4>

                {officers.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    <p className="italic mb-2">{t('no_officers_assigned_yet', 'No officers are assigned to this Kebele yet.')}</p>
                    <p className="text-[11px] text-slate-400">{t('assign_officers_first_hint', 'Please assign at least one agriculture officer to this kebele first in Officer Assignments.')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        {t('select_candidate_officer', 'Select an Assigned Officer')}
                      </label>
                      <select
                        className="w-full bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        value={selectedOfficerId}
                        onChange={(e) => setSelectedOfficerId(e.target.value)}
                      >
                        <option value="">{t('select_an_officer', '-- Select an officer --')}</option>
                        {officers.map((o) => (
                          <option key={o.officer_id} value={o.officer_id}>
                            {o.officer_name} ({o.officer_email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAssign}
                      disabled={actionLoading || !selectedOfficerId}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary-600 hover:bg-primary-500 active:scale-95 disabled:opacity-50 transition-all shadow-sm shadow-primary-500/25"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      <span>
                        {leadOfficer ? t('replace_lead_officer', 'Replace Lead Officer') : t('designate_lead_officer', 'Designate as Lead Officer')}
                      </span>
                    </button>
                  </div>
                )}
              </Card>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}