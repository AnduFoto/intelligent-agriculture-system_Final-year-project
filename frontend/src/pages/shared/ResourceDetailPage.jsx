import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getResource, toggleBookmark } from '../../api/educationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    setLoading(true);
    try {
      const data = await getResource(id);
      setResource(data);
      // Ideally backend returns if the current user has bookmarked it.
      // For now we just rely on the API toggle response.
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await toggleBookmark(id);
      setIsBookmarked(response.status === 'bookmarked');
      fetchResource(); // refresh count
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('loading_resource', 'Loading resource...')}</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Alert variant="error">{t('resource_not_found', 'Resource not found')}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
        <button onClick={() => navigate('/education/library')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {t('library', 'Library')}
        </button>
        <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-slate-800 dark:text-zinc-200">{resource.category_name}</span>
        <svg className="w-4 h-4 text-slate-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="truncate max-w-[200px] sm:max-w-[300px]">{resource.title}</span>
      </nav>

      <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800">
        
        {/* HEADER COVER */}
        <div className="relative h-64 md:h-96 bg-slate-900 overflow-hidden group">
          {resource.cover_image ? (
            <img 
              src={resource.cover_image} 
              alt={resource.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-30 bg-primary-900">
              <svg className="w-32 h-32 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-10">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="primary" className="text-xs uppercase tracking-wider">{resource.category_name}</Badge>
                {resource.topics?.map(t => (
                  <Badge key={t.id} variant="default" className="text-xs uppercase tracking-wider bg-white/20 text-white border-white/30 backdrop-blur-md">
                    {t.name}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                {resource.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white/80 text-sm font-medium">
                <button 
                  onClick={() => navigate(`/education/publishers/${resource.publisher}`)}
                  className="flex items-center gap-2 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {resource.publisher_name} ({resource.publisher_type})
                </button>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {t('published_by', 'Published by')} {resource.author_name}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(resource.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS & ACTIONS */}
        <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 md:px-10 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {resource.view_count} {t('views', 'Views')}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {resource.download_count} {t('downloads', 'Downloads')}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {resource.bookmark_count} {t('bookmarks', 'Bookmarks')}
            </div>
          </div>
          
          <Button 
            onClick={handleBookmark}
            variant={isBookmarked ? 'primary' : 'outline'}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <svg className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            {isBookmarked ? t('bookmarked', 'Bookmarked') : t('save', 'Save')}
          </Button>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-10 space-y-12">
          
          {/* Summary */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t('overview', 'Overview')}
            </h2>
            <div className="bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-primary-500 p-6 rounded-r-xl">
              <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                {resource.short_summary}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="prose prose-slate sm:prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-zinc-300 leading-loose prose-headings:text-slate-800 dark:prose-headings:text-white prose-a:text-primary-600 dark:prose-a:text-primary-400">
            <div dangerouslySetInnerHTML={{ __html: resource.content }} />
          </div>

          {/* Attachments */}
          {resource.attachments && resource.attachments.length > 0 && (
            <div className="pt-8 border-t border-slate-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                {t('downloadable_attachments', 'Downloadable Attachments')}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resource.attachments.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-primary-300 dark:hover:border-primary-900 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate">{item.file_name}</span>
                    </div>
                    <a 
                      href={item.file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-primary-600 dark:text-zinc-500 dark:hover:text-primary-400 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
