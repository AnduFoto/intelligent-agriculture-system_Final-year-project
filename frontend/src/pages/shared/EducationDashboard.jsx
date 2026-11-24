import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getResources } from '../../api/educationService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function EducationDashboard() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (user?.role !== 'ADMINISTRATOR') {
        params.authored_only = true;
      }
      const response = await getResources(params);
      const allRes = response.results || response;
      
      if (user?.role === 'ADMINISTRATOR') {
        setResources(allRes);
      } else {
        const currentUserId = user?.id ? Number(user.id) : null;
        setResources(allRes.filter(r => {
          const authorId = typeof r.created_by === 'object' ? Number(r.created_by?.id) : Number(r.created_by);
          const isOwn = currentUserId && authorId && authorId === currentUserId;
          // In the Officer Workspace, an officer should only see Kebele-level educational resources
          const isKebeleLevel = r.publisher_type === 'KEBELE';
          return isOwn && isKebeleLevel;
        }));
      }
    } catch (err) {
      setError(t('failed_load_resources', 'Failed to load your resources'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (!authLoading && user) {
      loadResources();
    }
  }, [authLoading, user, loadResources]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'ARCHIVED': return 'default';
      case 'DRAFT': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('my_educational_resources', 'My Educational Resources')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('my_educational_resources_desc', 'Manage the agricultural knowledge you have authored.')}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/education/manage/new')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          {t('create_new_resource', 'Create New Resource')}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{t('loading_resources', 'Loading resources...')}</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {t('no_resources_yet', 'No Resources Yet')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-sm">
              {t('no_resources_desc', 'You haven\'t authored any educational resources yet. Create your first one to share knowledge.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">{t('title', 'Title')}</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">{t('publisher', 'Publisher')}</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">{t('status', 'Status')}</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">{t('views', 'Views')}</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider text-right">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {resources.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200">
                      {record.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400 font-medium">
                      {record.publisher_name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(record.status)} className="px-2 py-1 text-[10px]">
                        {t(record.status.toLowerCase(), record.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-500 font-semibold">
                      {record.view_count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(user?.role === 'ADMINISTRATOR' || Number(record.created_by) === Number(user?.id)) ? (
                        <button 
                          onClick={() => navigate(`/education/manage/edit/${record.id}`)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          {t('edit', 'Edit')}
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate(`/education/resources/${record.id}`)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          {t('view', 'View')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
