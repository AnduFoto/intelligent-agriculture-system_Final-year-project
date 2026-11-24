import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dashboardService from '../../api/dashboardService';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function OfficerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getDashboardStats()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const stats = data?.stats || {};
  const activity = data?.recent_activity || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('welcome_back_user', { name: user?.first_name || 'Officer', defaultValue: `Welcome, ${user?.first_name || 'Officer'}` })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('officer_dashboard_subtitle', 'Here is an overview of your responsibilities.')}
          </p>
        </div>
        
        <Link
          to="/officer/consultations"
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          {t('open_inbox', 'Open Inbox')}
        </Link>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title={t('pending_consultations', 'Pending Consultations')}
          value={stats.pending_consultations || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
        <StatCard
          title={t('assigned_kebeles', 'Assigned Kebeles')}
          value={stats.assigned_kebeles || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title={t('articles_published', 'Articles Published')}
          value={stats.articles_published || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatCard
          title={t('scans_reviewed', 'Scans Reviewed')}
          value={stats.scans_reviewed || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:gap-8">
        
        {/* RECENT ACTIVITY / ANNOUNCEMENTS */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {t('officer_activity', 'Officer Activity')}
          </h2>
          
          <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800/80">
            {activity.length > 0 ? (
              activity.map((item, i) => {
                let parsedTitle = item.title;
                let parsedDesc = item.desc;
                
                if (item.title.startsWith("New Message: ")) {
                  parsedTitle = t('notif_new_message_prefix', 'New Message: ') + item.title.replace("New Message: ", "");
                }
                if (item.title === "Disease Prediction Complete") {
                  parsedTitle = t('notif_prediction_complete', 'Disease Prediction Complete');
                }
                if (item.desc && item.desc.includes("sent a new message.")) {
                  parsedDesc = item.desc.replace(" sent a new message.", "") + " " + t('notif_message_sent_prefix', 'sent a new message.');
                }
                if (item.desc && item.desc.startsWith("Analysis of ") && item.desc.includes("completed: ")) {
                  const match = item.desc.match(/Analysis of (.+) completed: (.+)/);
                  if (match) {
                    parsedDesc = t('notif_analysis_of', 'Analysis of ') + match[1] + t('notif_completed', ' completed: ') + match[2];
                  }
                }

                return (
                  <ActivityItem 
                    key={i}
                    title={parsedTitle}
                    desc={parsedDesc}
                    time={item.time}
                    type={item.type}
                  />
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
                {t('no_recent_activity', 'No recent activity.')}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}

// Subcomponents

function ActivityItem({ title, desc, time, type }) {
  const badgeConfig = {
    danger: { color: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
    success: { color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
    info: { color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
  };

  const { color } = badgeConfig[type] || badgeConfig.info;

  return (
    <div className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer">
      <div className={`mt-1.5 w-2 h-2 rounded-full ${color} shrink-0`} />
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{title}</p>
        {desc && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{desc}</p>}
        <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mt-1.5">{time}</p>
      </div>
    </div>
  );
}

export default OfficerDashboard;