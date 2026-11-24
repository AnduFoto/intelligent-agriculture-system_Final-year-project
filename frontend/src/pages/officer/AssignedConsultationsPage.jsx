import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import consultationService from '../../api/consultationService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';

export default function AssignedConsultationsPage() {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await consultationService.listMyConsultations();
        setConsultations(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(t('failed_load_assigned_consultations', 'Failed to load assigned consultations.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const active = consultations.filter((c) => !['RESOLVED', 'CLOSED'].includes(c.status));
  const past = consultations.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          {t('assigned_consultations', 'Assigned Consultations')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          {t('assigned_consultations_desc', 'Manage and respond to farmer consultations assigned to you.')}
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{t('loading_consultations', 'Loading consultations...')}</p>
        </div>
      ) : consultations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800 bg-transparent shadow-none">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t('no_assigned_consultations', 'No Assigned Consultations')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-sm">
            {t('no_assigned_consultations_desc', 'There are currently no consultations assigned to you for review.')}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                {t('active_consultations', 'Active Consultations')}
              </h2>
              <Badge variant="primary" className="rounded-full px-2.5 min-w-[2rem] text-center">{active.length}</Badge>
            </div>
            
            {active.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500 italic py-4">{t('no_active_consultations', 'No active consultations.')}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="pt-6 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                  {t('past_consultations', 'Past Consultations')}
                </h2>
                <Badge variant="default" className="rounded-full px-2.5 min-w-[2rem] text-center">{past.length}</Badge>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 opacity-75 hover:opacity-100 transition-opacity">
                {past.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
              </div>
            </section>
          )}
          
        </div>
      )}
    </div>
  );
}

function ConsultationCard({ consultation: c }) {
  const { t } = useTranslation();

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

  return (
    <Link to={`/officer/consultations/${c.id}`} className="block group">
      <Card className="h-full border border-slate-100 dark:border-zinc-800/80 hover:border-primary-200 dark:hover:border-primary-500/30 shadow-sm hover:shadow-lg transition-all duration-300 p-5 group-hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 flex-1">
            {c.title}
          </h3>
          <Badge variant={getStatusVariant(c.status)} className="shrink-0 text-[10px]">
            {t(c.status.toLowerCase(), c.status.replace(/_/g, ' '))}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 mb-4 font-medium">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            {c.crop_name}
          </span>
          <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {c.kebele_name}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-zinc-800/50">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[10px]">
              {c.farmer_full_name?.charAt(0) || 'F'}
            </span>
            <span className="truncate max-w-[120px] sm:max-w-[150px]">{c.farmer_full_name}</span>
          </p>
          <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </Card>
    </Link>
  );
}