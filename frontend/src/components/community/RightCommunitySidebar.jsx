import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import communityService from '../../api/communityService';

export const RightCommunitySidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState({ popular_posts: [], recent_resources: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityService.getTrendingCommunity()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 sticky top-20">
      {/* Educational Resources */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>{t('community.educationalResources', 'Agricultural Guides')}</span>
          </div>

          <button
            onClick={() => navigate('/education/library')}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('community.viewAll', 'View All')}
          </button>
        </div>

        <div className="space-y-3">
          {data.recent_resources.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No resources available yet.</div>
          ) : (
            data.recent_resources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => navigate(`/education/resources/${resource.id}`)}
                className="group flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700"
              >
                {resource.cover_image ? (
                  <img
                    src={resource.cover_image}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {resource.title}
                  </h4>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {resource.publisher_name || 'Extension Service'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightCommunitySidebar;
