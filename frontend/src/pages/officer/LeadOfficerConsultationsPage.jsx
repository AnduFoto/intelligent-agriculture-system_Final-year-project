import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import specializationService from '../../api/specializationService';
import consultationService from '../../api/consultationService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import SelectField from '../../components/ui/SelectField';

export default function LeadOfficerConsultationsPage() {
  const { t } = useTranslation();
  const [kebele, setKebele] = useState(null);
  const [checkingLead, setCheckingLead] = useState(true);

  const [consultations, setConsultations] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    (async () => {
      setCheckingLead(true);
      try {
        const data = await specializationService.getMyLeadKebele();
        setKebele(data.lead_officer ? {
          id: data.lead_officer.kebele_id,
          name: data.lead_officer.kebele_name,
        } : null);
      } catch (err) {
        setError(t('failed_check_lead_status', 'Failed to check Lead Officer status.'));
      } finally {
        setCheckingLead(false);
      }
    })();
  }, [t]);

  const loadData = useCallback(async () => {
    if (!kebele) return;
    setLoadingData(true);
    setError('');
    try {
      const [list, load] = await Promise.all([
        consultationService.listKebeleConsultations(kebele.id),
        consultationService.getKebeleOfficerWorkload(kebele.id),
      ]);
      setConsultations(Array.isArray(list) ? list : list.results || []);
      setWorkload(load);
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_load_kebele_consultations', 'Failed to load Kebele consultations.'));
    } finally {
      setLoadingData(false);
    }
  }, [kebele, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'NEW': return 'default';
      case 'ASSIGNED': return 'blue';
      case 'WAITING_FOR_FARMER': return 'warning';
      case 'WAITING_FOR_OFFICER': return 'purple';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  if (checkingLead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{t('checking_lead_status', 'Checking Lead Officer status...')}</p>
      </div>
    );
  }

  if (!kebele) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <Alert variant="error">
          {t('not_lead_officer', 'You are not currently designated as a Lead Officer for any Kebele.')}
        </Alert>
      </div>
    );
  }

  const filtered = statusFilter === 'ALL'
    ? consultations
    : consultations.filter((c) => c.status === statusFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          {t('kebele_consultations', 'Kebele Consultations')}
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mt-1">
          {t('lead_officer_overview', 'Lead Officer overview for')} <span className="text-primary-600 dark:text-primary-400">{kebele.name}</span>
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT/TOP: OFFICERS WORKLOAD (SIDEBAR ON DESKTOP) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-0 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {t('officer_workload', 'Officer Workload')}
              </h2>
            </div>
            
            <div className="p-2">
              {workload.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500 italic p-4 text-center">{t('no_officers_assigned', 'No officers assigned to this Kebele.')}</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {workload.map((w) => (
                    <li key={w.officer_id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {w.officer_full_name?.charAt(0) || 'O'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">{w.officer_full_name}</p>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">{w.officer_email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={w.active_consultations > 10 ? 'danger' : w.active_consultations > 5 ? 'warning' : 'success'} className="rounded-full">
                          {w.active_consultations}
                        </Badge>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold mt-1">{t('active', 'Active')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT/BOTTOM: CONSULTATIONS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {t('all_consultations', 'All Consultations')} 
                <span className="text-slate-400 dark:text-zinc-500 font-normal">({filtered.length})</span>
              </h2>
              
              <div className="w-full sm:w-48">
                <SelectField
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <option value="ALL">{t('all_statuses', 'All statuses')}</option>
                  <option value="NEW">{t('new', 'New')}</option>
                  <option value="ASSIGNED">{t('assigned', 'Assigned')}</option>
                  <option value="WAITING_FOR_FARMER">{t('waiting_for_farmer', 'Waiting for Farmer')}</option>
                  <option value="WAITING_FOR_OFFICER">{t('waiting_for_officer', 'Waiting for Officer')}</option>
                  <option value="RESOLVED">{t('resolved', 'Resolved')}</option>
                  <option value="CLOSED">{t('closed', 'Closed')}</option>
                </SelectField>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {loadingData ? (
                 <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <svg className="w-12 h-12 text-slate-200 dark:text-zinc-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">{t('no_consultations_match', 'No consultations match this filter.')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((c) => (
                    <Link key={c.id} to={`/officer/kebele-consultations/${c.id}`} className="block group">
                      <div className="border border-slate-100 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5 hover:border-primary-200 dark:hover:border-primary-500/30 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group-hover:-translate-y-0.5 bg-white dark:bg-zinc-900">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full pointer-events-none" />
                        
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 flex-1">
                            {c.title}
                          </h3>
                          <Badge variant={getStatusVariant(c.status)} className="shrink-0 text-[10px]">
                            {t(c.status.toLowerCase(), c.status.replace(/_/g, ' '))}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-zinc-400 mb-4 font-medium">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            {c.crop_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {t('farmer', 'Farmer')}: {c.farmer_full_name}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-zinc-800/50">
                          {c.assigned_officer_email ? (
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {t('assigned_to', 'Assigned to')} {c.assigned_officer_email}
                            </p>
                          ) : (
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600"></span>
                              {t('unassigned', 'Unassigned')}
                            </p>
                          )}
                          <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}