import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { predictionService } from '../../api/predictionService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';

export default function PredictionHistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'HEALTHY', 'DISEASED'
  
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    predictionService
      .listHistory()
      .then((response) => setHistory(response.data.results || response.data || []))
      .catch(() => setError(t('could_not_load_history', 'Could not load prediction history.')))
      .finally(() => setIsLoading(false));
  }, [t]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        !searchQuery ||
        (item.display_name && item.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.crop && item.crop.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchFilter =
        filterType === 'ALL' ||
        (filterType === 'HEALTHY' && item.is_healthy) ||
        (filterType === 'DISEASED' && !item.is_healthy);

      return matchSearch && matchFilter;
    });
  }, [history, searchQuery, filterType]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('prediction_history', 'Prediction History')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('prediction_history_desc', 'Your past crop disease diagnoses and health analyses.')}
          </p>
        </div>
        
        <Link
          to="/farmer/predict"
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          {t('new_diagnosis', 'New Diagnosis')}
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* FILTER & SEARCH BAR */}
      {!isLoading && history.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_predictions_placeholder', 'Search by crop or disease name...')}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl self-start sm:self-auto">
            {['ALL', 'DISEASED', 'HEALTHY'].map((filter) => {
              const active = filterType === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    active
                      ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {filter === 'ALL'
                    ? t('all', 'All')
                    : filter === 'HEALTHY'
                    ? t('healthy', 'Healthy')
                    : t('diseased', 'Diseased')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden h-[320px]">
              <div className="h-44 bg-slate-200 dark:bg-zinc-800" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 px-4 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800 bg-transparent shadow-none hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t('no_predictions_yet', 'No Predictions Yet')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-6">
            {t('no_predictions_desc', 'You haven\'t analyzed any crops yet. Upload a clear photo of a crop leaf to get started with an AI diagnosis.')}
          </p>
          <Link
            to="/farmer/predict"
            className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {t('analyze_first_image', 'Analyze your first crop image')} &rarr;
          </Link>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-100 dark:border-zinc-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {t('no_matching_records', 'No prediction records match your search or filter.')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('ALL');
            }}
            className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('reset_filters', 'Reset filters')}
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHistory.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(`/farmer/predictions/${item.id}`)}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 overflow-hidden flex flex-col relative hover:-translate-y-1"
            >
              <div className="relative h-48 bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.display_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md ${
                    item.is_healthy 
                      ? 'bg-primary-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {item.is_healthy ? t('healthy', 'Healthy') : t('disease_detected', 'Disease Detected')}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest truncate max-w-[120px]">
                    {item.crop}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 font-mono">
                    {item.confidence}% {t('conf', 'Conf.')}
                  </p>
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {item.display_name}
                </h3>
                
                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-zinc-800/50 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}