import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getResources } from '../../api/educationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SelectField from '../../components/ui/SelectField';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function ResourceLibraryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role } = useAuth();
  
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [publisherType, setPublisherType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publisherType]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (publisherType) params.publisher__publisher_type = publisherType;
      
      const data = await getResources(params);
      setResources(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const clearFilters = () => {
    setSearch('');
    setPublisherType('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('agricultural_knowledge_base', 'Agricultural Knowledge Base')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('knowledge_base_desc', 'Discover verified guides, research, and preventive measures published by official educational teams.')}
          </p>
        </div>
        
        <div className="flex items-center  gap-3">
          <Link
            to="/education/saved"
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {t('saved_guides', 'Saved Guides')}
          </Link>

          {(role === 'ADMINISTRATOR' || role === 'OFFICER') && (
            <Link
              to="/education/manage"
              className="text-sm font-bold text-slate-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2.5 rounded-xl"
            >
              {t('manage_articles', 'Manage')}
            </Link>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card className="p-4 sm:p-5 shadow-md border-primary-100 dark:border-primary-500/20">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none"
              placeholder={t('search_resources_placeholder', 'Search by title, crop, or topic...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <SelectField
              value={publisherType}
              onChange={setPublisherType}
            >
              <option value="">{t('all_publisher_types', 'All Publisher Types')}</option>
              <option value="WOREDA">{t('woreda_education', 'Woreda Education')}</option>
              <option value="SPECIAL_WOREDA">{t('special_woreda_education', 'Special Woreda Education')}</option>
              <option value="KEBELE">{t('kebele_education', 'Kebele Education')}</option>
            </SelectField>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="px-6 shadow-primary-500/20">
              {t('search', 'Search')}
            </Button>
            {(search || publisherType) && (
              <Button type="button" variant="outline" onClick={clearFilters} className="px-4">
                {t('clear', 'Clear')}
              </Button>
            )}
          </div>
        </form>

        {/* QUICK CATEGORY FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 mr-1">
            {t('publisher_scope', 'Scope')}:
          </span>
          {[
            { label: t('all', 'All'), value: '' },
            { label: t('woreda', 'Woreda'), value: 'WOREDA' },
            { label: t('special_woreda', 'Special Woreda'), value: 'SPECIAL_WOREDA' },
            { label: t('kebele', 'Kebele'), value: 'KEBELE' },
          ].map((scope) => {
            const active = publisherType === scope.value;
            return (
              <button
                key={scope.value}
                type="button"
                onClick={() => setPublisherType(scope.value)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {scope.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* RESULTS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden h-[340px] flex flex-col">
              <div className="h-44 bg-slate-200 dark:bg-zinc-800" />
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-full mt-2" />
                <div className="mt-auto h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 px-4 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800 bg-transparent shadow-none hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t('no_resources_found', 'No Resources Found')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-6">
            {t('no_resources_match_desc', 'We could not find any educational resources matching your current search or filters.')}
          </p>
          {(search || publisherType) && (
            <Button variant="outline" onClick={clearFilters}>
              {t('clear_all_filters', 'Clear All Filters')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => navigate(`/education/resources/${resource.id}`)}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 overflow-hidden flex flex-col h-full relative hover:-translate-y-1"
            >
              {/* IMAGE HEADER */}
              <div className="h-48 bg-slate-100 dark:bg-zinc-800 relative overflow-hidden">
                {resource.cover_image ? (
                  <img 
                    alt={resource.title} 
                    src={resource.cover_image} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-200 dark:text-primary-900/30 bg-primary-50 dark:bg-zinc-900">
                    <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                
                {/* GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* CATEGORY BADGE */}
                {resource.category_name && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-primary-700 dark:text-primary-400 rounded-full shadow-sm">
                      {resource.category_name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* CONTENT */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                  {resource.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {resource.short_summary || t('no_summary_provided', 'No summary provided.')}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-zinc-800/50 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <svg className="w-3.5 h-3.5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{resource.publisher_name}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600 group-hover:text-primary-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
