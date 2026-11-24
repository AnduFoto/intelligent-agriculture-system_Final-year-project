import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBookmarkedResources } from '../../api/educationService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function SavedEducationalContentPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getBookmarkedResources();
      setResources(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch saved resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    if (!search.trim()) return resources;
    const q = search.toLowerCase();
    return resources.filter((r) =>
      r.title?.toLowerCase().includes(q) ||
      r.short_summary?.toLowerCase().includes(q) ||
      r.category_name?.toLowerCase().includes(q) ||
      r.publisher_name?.toLowerCase().includes(q)
    );
  }, [resources, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text- ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('saved_educational_content', 'Saved Educational Content')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('saved_educational_content_desc', 'Easily access all the agricultural guides, research, and preventive measures you have bookmarked.')}
          </p>
        </div>
        
        <Link
          to="/education/library"
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {t('browse_library', 'Browse Library')}
        </Link>
      </div>

      {/* SEARCH BAR (WHEN BOOKMARKS EXIST) */}
      {!loading && resources.length > 0 && (
        <Card className="p-3 sm:p-4 shadow-md border-primary-100 dark:border-primary-500/20">
          <div className="relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none"
              placeholder={t('search_saved_placeholder', 'Search within your saved guides...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* RESULTS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t('no_saved_resources', 'No Saved Resources')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-6">
            {t('no_saved_resources_desc', 'You haven\'t bookmarked any educational resources yet. Browse the library to find useful guides.')}
          </p>
          <Link
            to="/education/library"
            className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {t('browse_library_link', 'Browse knowledge library')} &rarr;
          </Link>
        </Card>
      ) : filteredResources.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-100 dark:border-zinc-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {t('no_matching_saved_resources', 'No saved resources match your search.')}
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('clear_search', 'Clear search')}
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
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
