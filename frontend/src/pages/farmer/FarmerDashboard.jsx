import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dashboardService from '../../api/dashboardService';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function FarmerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('welcome_back_user', { name: user?.first_name || 'Farmer', defaultValue: `Welcome, ${user?.first_name || 'Farmer'}` })}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('farmer_dashboard_subtitle', 'Here is an overview of your agricultural diagnostics, consultations, and field activities.')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/predict"
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('new_scan', 'New Scan')}
          </Link>
        </div>
      </div>

      {/* QUICK SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/farmer/predict"
          className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-primary-300 dark:hover:border-primary-500/40 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {t('crop_scan', 'Scan Crop')}
          </span>
        </Link>

        <Link
          to="/farmer/consultations/new"
          className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-primary-300 dark:hover:border-primary-500/40 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {t('ask_expert', 'Ask Expert')}
          </span>
        </Link>

        <Link
          to="/education/library"
          className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-primary-300 dark:hover:border-primary-500/40 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {t('farming_guides', 'Farming Guides')}
          </span>
        </Link>

        <Link
          to="/farmer/reports"
          className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-primary-300 dark:hover:border-primary-500/40 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {t('reports_analytics', 'Analytics')}
          </span>
        </Link>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title={t('scans_this_month', 'Scans This Month')}
          value={stats.scans_this_month || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          title={t('active_consultations', 'Active Consultations')}
          value={stats.active_consultations || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
        <StatCard
          title={t('saved_articles', 'Saved Articles')}
          value={stats.saved_articles || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
        />
        <StatCard
          title={t('unread_alerts', 'Unread Alerts')}
          value={stats.unread_alerts || "0"}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            {t('recent_activity', 'Recent Activity')}
          </h2>
          <Link to="/notifications" className="text-xs font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors">
            {t('view_all', 'View All')} &rarr;
          </Link>
        </div>
          
        <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800/80 shadow-md border-primary-100 dark:border-primary-500/20">
          {activity.length > 0 ? (
            activity.map((item, i) => {
              let parsedTitle = item.title;
              let parsedDesc = item.desc;
              
              if (item.title?.startsWith("New Message: ")) {
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
            <div className="p-12 text-center text-slate-500 dark:text-zinc-400 text-sm">
              <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-700 dark:text-zinc-300">{t('no_recent_activity', 'No recent activity.')}</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{t('activity_will_appear', 'Your scans, consultations, and alerts will appear here.')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, type }) {
  const badgeConfig = {
    danger: { color: 'bg-red-500', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    success: { color: 'bg-emerald-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    info: { color: 'bg-blue-500', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  };

  const { color } = badgeConfig[type] || badgeConfig.info;

  return (
    <div className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">
      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{title}</p>
        {time && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">{time}</p>}
      </div>
    </div>
  );
}

export default FarmerDashboard;