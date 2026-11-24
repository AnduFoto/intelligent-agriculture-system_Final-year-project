import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublisher, getResources } from '../../api/educationService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function PublisherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [publisher, setPublisher] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pubData = await getPublisher(id);
      setPublisher(pubData);
      
      const resData = await getResources({ publisher__id: id });
      setResources(resData.results || resData);
    } catch (error) {
      console.error('Failed to fetch publisher profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('loading_profile', 'Loading profile...')}</p>
      </div>
    );
  }

  if (!publisher) {
    return (
      <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 bg-transparent shadow-none max-w-2xl mx-auto mt-10">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {t('publisher_not_found', 'Publisher Not Found')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md">
          {t('publisher_not_found_desc', 'The agricultural office or organization you are looking for could not be found.')}
        </p>
        <Button variant="outline" onClick={() => navigate('/education/library')} className="mt-6">
          {t('back_to_library', 'Back to Library')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen pb-12 animate-fadeIn">
      {/* HERO COVER */}
      <div className="h-64 md:h-80 bg-slate-900 relative">
        {publisher.cover_image ? (
          <img 
            src={publisher.cover_image} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 opacity-90" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-transparent to-transparent opacity-100" />
      </div>

      {/* PROFILE CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10">
        
        <Card className="p-6 md:p-10 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* LOGO */}
            <div className="shrink-0 -mt-16 md:-mt-20">
              {publisher.logo ? (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl shadow-xl border-4 border-white dark:border-zinc-900 overflow-hidden bg-white">
                  <img 
                    src={publisher.logo} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl shadow-xl border-4 border-white dark:border-zinc-900 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 space-y-4 pt-2">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge variant={publisher.publisher_type === 'WOREDA' ? 'purple' : 'blue'} className="px-3 py-1 font-bold text-xs uppercase tracking-wider">
                    {publisher.publisher_type === 'WOREDA' ? t('woreda_level', 'Woreda Level') : t('kebele_level', 'Kebele Level')}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                  {publisher.name}
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {publisher.office_address || t('official_agricultural_office', 'Official Agricultural Office')}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-zinc-300 text-base leading-relaxed max-w-3xl font-medium">
                {publisher.description || t('publisher_default_desc', 'Official agricultural knowledge publisher dedicated to improving farming practices and crop yields through verified educational resources.')}
              </p>
              
              <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-100 dark:border-zinc-800/80 text-sm font-semibold text-slate-600 dark:text-zinc-400">
                {publisher.contact_email && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-700/50">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {publisher.contact_email}
                  </div>
                )}
                {publisher.contact_phone && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-700/50">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {publisher.contact_phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* PUBLISHED RESOURCES */}
            <Card className="p-6 md:p-8">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  {t('published_resources', 'Published Resources')}
                </h2>
                <button 
                  onClick={() => navigate('/education/library')} 
                  className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
                >
                  {t('view_library', 'View Library')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

              {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('no_resources_published', 'No resources published yet')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map(resource => (
                    <div 
                      key={resource.id}
                      onClick={() => navigate(`/education/resources/${resource.id}`)}
                      className="group cursor-pointer p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-primary-200 dark:hover:border-primary-900/50 hover:shadow-md transition-all duration-300 bg-white dark:bg-zinc-900 flex items-start gap-4"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-zinc-800">
                        {resource.cover_image ? (
                          <img src={resource.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-300 dark:text-primary-800">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col h-20 justify-center">
                        <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 text-sm leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                          {resource.title}
                        </h3>
                        {resource.category_name && (
                          <Badge variant="default" className="w-fit text-[10px] uppercase tracking-wider">
                            {resource.category_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* EDUCATIONAL TEAM */}
            <Card className="p-6 md:p-8 sticky top-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                {t('educational_team', 'Educational Team')}
              </h2>
              
              {publisher.educational_team?.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500 italic p-4 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">{t('no_active_team_members', 'No active team members assigned.')}</p>
              ) : (
                <div className="space-y-3">
                  {publisher.educational_team?.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-700">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                        {member.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-white block truncate">
                          {member.full_name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block truncate uppercase tracking-wider mt-0.5" title={member.position}>
                          {member.position || t('officer', 'Officer')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
