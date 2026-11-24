import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import Card from '../../components/ui/Card';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Users,
  ChevronRight,
  X,
  Layers
} from 'lucide-react';

function OfficerListPage() {
  const { t } = useTranslation();
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [coverageFilter, setCoverageFilter] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'UNASSIGNED'

  useEffect(() => {
    setIsLoading(true);
    adminService
      .listUsers({ role: 'OFFICER' })
      .then((res) => setOfficers(res.data.results || res.data))
      .catch((err) => console.error('Failed to load officers', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Compute statistics
  const stats = useMemo(() => {
    const total = officers.length;
    const active = officers.filter(o => o.status === 'ACTIVE').length;
    const withAssignments = officers.filter(o => (o.assignments?.length || 0) > 0).length;
    const unassigned = total - withAssignments;
    return { total, active, withAssignments, unassigned };
  }, [officers]);

  // Filtered officers
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      const term = searchTerm.trim().toLowerCase();
      const nameMatch = (o.full_name || `${o.first_name || ''} ${o.last_name || ''}`).toLowerCase().includes(term);
      const emailMatch = (o.email || '').toLowerCase().includes(term);
      const phoneMatch = (o.phone_number || '').toLowerCase().includes(term);
      const matchesSearch = !term || nameMatch || emailMatch || phoneMatch;

      const assignmentCount = o.assignments?.length || 0;
      let matchesCoverage = true;
      if (coverageFilter === 'ASSIGNED') {
        matchesCoverage = assignmentCount > 0;
      } else if (coverageFilter === 'UNASSIGNED') {
        matchesCoverage = assignmentCount === 0;
      }

      return matchesSearch && matchesCoverage;
    });
  }, [officers, searchTerm, coverageFilter]);

  const hasActiveFilters = Boolean(searchTerm || coverageFilter !== 'ALL');

  const clearFilters = () => {
    setSearchTerm('');
    setCoverageFilter('ALL');
  };

  return (
    <div className="space-y-6 ml-4 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless page background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200/60 dark:border-blue-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {t('jurisdiction_management', 'Jurisdiction Management')}
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('officer_kebele_assignments', 'Officer Kebele Assignments')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('select_officer_to_manage', 'Select an Agriculture Officer to manage and inspect their assigned operational Kebeles.')}
          </p>
        </div>
      </div>

      {/* 2. Stat Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('total_officers', 'Total Officers')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('active_status', 'Active')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.active}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {t('assigned_officers', 'Assigned')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.withAssignments}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('unassigned_officers', 'Unassigned')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.unassigned}</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_officers_placeholder', 'Search officers by name, email, or phone...')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCoverageFilter('ALL')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  coverageFilter === 'ALL'
                    ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                {t('all', 'All')} ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setCoverageFilter('ASSIGNED')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  coverageFilter === 'ASSIGNED'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                {t('assigned', 'Assigned')} ({stats.withAssignments})
              </button>
              <button
                type="button"
                onClick={() => setCoverageFilter('UNASSIGNED')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  coverageFilter === 'UNASSIGNED'
                    ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                {t('unassigned', 'Unassigned')} ({stats.unassigned})
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shrink-0"
              >
                {t('reset', 'Reset')}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Officers Table / Directory */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
              {t('loading_officers', 'Loading officers...')}
            </p>
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              {t('no_officers_found', 'No officers found')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-4">
              {hasActiveFilters 
                ? t('no_officers_match_filter', 'No officers match your search or filter criteria. Try adjusting filters.') 
                : t('no_officers_yet', 'No Officer accounts exist yet.')}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800/50 transition-colors"
              >
                {t('clear_all_filters', 'Clear All Filters')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px] text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="px-6 py-4">{t('officer_profile', 'Officer Profile')}</th>
                  <th className="px-6 py-4">{t('status', 'Status')}</th>
                  <th className="px-6 py-4">{t('base_location', 'Base Location')}</th>
                  <th className="px-6 py-4">{t('assigned_kebeles', 'Assigned Kebeles')}</th>
                  <th className="px-6 py-4 text-right">{t('action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {filteredOfficers.map((o) => {
                  const initials = (o.full_name || o.first_name || o.email || 'O')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const assignedCount = o.assignments?.length || 0;
                  const locationText = [o.woreda_name || o.special_woreda_name, o.zone_name, o.region_name]
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors duration-150"
                    >
                      {/* Officer Profile & Contact */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shrink-0 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate">
                              {o.full_name || `${o.first_name || ''} ${o.last_name || ''}`.trim() || t('unnamed_officer', 'Unnamed Officer')}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                {o.email}
                              </span>
                              {o.phone_number && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <Phone className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                  {o.phone_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {o.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t('status_active', 'Active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {t('status_suspended', 'Suspended')}
                          </span>
                        )}
                      </td>

                      {/* Base Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[200px]" title={locationText}>
                            {locationText || t('unspecified', 'Unassigned')}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Kebeles Count & Tags */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignedCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                              <Layers className="w-3 h-3" />
                              {assignedCount} {assignedCount === 1 ? t('kebele', 'Kebele') : t('kebeles', 'Kebeles')}
                            </span>
                            {/* Preview first 2 kebeles */}
                            <div className="hidden lg:flex items-center gap-1 max-w-[220px] overflow-hidden">
                              {o.assignments.slice(0, 2).map((a, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 truncate max-w-[90px]"
                                  title={a.kebele?.name}
                                >
                                  {a.kebele?.name}
                                </span>
                              ))}
                              {assignedCount > 2 && (
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">
                                  +{assignedCount - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-zinc-500 italic">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            {t('no_kebeles_assigned', 'No Kebeles assigned')}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/admin/users/${o.id}/kebeles`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200/80 dark:border-primary-800/50 transition-all duration-150 active:scale-95 group"
                        >
                          <span>{t('manage_kebeles', 'Manage Kebeles')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
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

export default OfficerListPage;