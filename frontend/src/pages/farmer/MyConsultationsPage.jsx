import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import consultationService from '../../api/consultationService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';

export default function MyConsultationsPage() {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'RESOLVED', 'CLOSED'

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await consultationService.listMyConsultations();
        setConsultations(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(t('failed_load_consultations', 'Failed to load your consultations.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

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

  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      const matchSearch =
        !searchQuery ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.crop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.kebele_name?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchStatus = ['NEW', 'ASSIGNED', 'WAITING_FOR_FARMER', 'WAITING_FOR_OFFICER'].includes(c.status);
      } else if (statusFilter === 'RESOLVED') {
        matchStatus = c.status === 'RESOLVED';
      } else if (statusFilter === 'CLOSED') {
        matchStatus = c.status === 'CLOSED';
      }

      return matchSearch && matchStatus;
    });
  }, [consultations, searchQuery, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('my_consultations', 'My Consultations')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('my_consultations_desc', 'Track and manage your agricultural consultations with extension officers.')}
          </p>
        </div>
        
        <Link
          to="/farmer/consultations/new"
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          {t('new_consultation', 'New Consultation')}
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* FILTER & SEARCH TOOLBAR */}
      {!loading && consultations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_consultations_placeholder', 'Search by title, crop, or kebele...')}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl self-start sm:self-auto">
            {['ALL', 'ACTIVE', 'RESOLVED', 'CLOSED'].map((filter) => {
              const active = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    active
                      ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {filter === 'ALL'
                    ? t('all', 'All')
                    : filter === 'ACTIVE'
                    ? t('active', 'Active')
                    : filter === 'RESOLVED'
                    ? t('resolved', 'Resolved')
                    : t('closed', 'Closed')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
                <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-16" />
              </div>
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-full pt-4" />
            </div>
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 px-4 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800 bg-transparent shadow-none hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t('no_consultations_yet', 'No Consultations Yet')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-sm">
            {t('no_consultations_desc', 'You haven\'t started any consultations. Get expert advice by creating a new consultation.')}
          </p>
          <Link to="/farmer/consultations/new" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            {t('start_first_consultation', 'Start your first consultation')} &rarr;
          </Link>
        </Card>
      ) : filteredConsultations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-100 dark:border-zinc-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {t('no_matching_consultations', 'No consultations match your filter or search.')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('reset_filters', 'Reset filters')}
          </button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredConsultations.map((c) => (
            <Link key={c.id} to={`/farmer/consultations/${c.id}`} className="block group">
              <Card className="h-full border border-slate-100 dark:border-zinc-800/80 hover:border-primary-200 dark:hover:border-primary-500/30 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 p-6 group-hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full pointer-events-none" />
                
                <div>
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 flex-1">
                      {c.title}
                    </h3>
                    <Badge variant={getStatusVariant(c.status)} className="shrink-0 text-[10px] uppercase font-bold tracking-wider">
                      {t(c.status.toLowerCase(), c.status.replace(/_/g, ' '))}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-4 font-medium">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      {c.crop_name}
                    </span>
                    <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {c.kebele_name}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800/50">
                  {c.assigned_officer_email ? (
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 truncate max-w-[200px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="truncate">{t('assigned_to', 'Assigned')}: {c.assigned_officer_email}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {t('unassigned', 'Awaiting Officer')}
                    </p>
                  )}
                  <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:text-primary-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}