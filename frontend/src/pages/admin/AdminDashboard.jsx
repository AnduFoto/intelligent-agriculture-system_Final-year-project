import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dashboardService from '../../api/dashboardService';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  AlertTriangle, 
  UserPlus, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  FileText, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

function AdminDashboard() {
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
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
          {t('loading_dashboard', 'Loading platform overview...')}
        </p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const activity = data?.recent_activity || [];

  return (
    <div className="space-y-6 ml-4 sm:space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black hero banner) */}
      <div className="flex left-4 flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-2 border border-primary-200/60 dark:border-primary-800/40">
            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            {t('platform_overview', 'Platform Administration')}
          </div> */}
          <h1 className="text-2xl  sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('welcome_back_user', { name: user?.first_name || 'Admin', defaultValue: `Welcome back, ${user?.first_name || 'Admin'}` })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('admin_dashboard_subtitle', 'Manage users, locations, and oversee agricultural operations.')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>{t('view_reports', 'Analytics')}</span>
          </Link>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm shadow-primary-500/25 transition-all text-xs sm:text-sm active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('manage_users', 'Manage Users')}</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('total_users', 'Total Users')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-200/60 dark:border-purple-800/40">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-3">
            {stats.total_users || "0"}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
            <Link to="/admin/users" className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-0.5">
              <span>{t('view_directory', 'View directory')}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('active_kebeles', 'Active Kebeles')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200/60 dark:border-emerald-800/40">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-3">
            {stats.active_kebeles || "0"}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
            <Link to="/admin/locations" className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-0.5">
              <span>{t('manage_hierarchy', 'Manage hierarchy')}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('total_consultations', 'Consultations')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-200/60 dark:border-blue-800/40">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-3">
            {stats.total_consultations || "0"}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
            <Link to="/admin/consultations" className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-0.5">
              <span>{t('view_consultations', 'View consultations')}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('system_alerts', 'System Alerts')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200/60 dark:border-amber-800/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-3">
            {stats.system_alerts || "0"}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
            <Link to="/admin/activity" className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-0.5">
              <span>{t('inspect_logs', 'Inspect logs')}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. QUICK NAVIGATION SHORTCUTS */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3 px-1">
          {t('quick_management_actions', 'Administrative Hub')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/admin/users"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-200 shadow-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              {t('user_management', 'Users')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {t('roles_permissions', 'Roles & Status')}
            </p>
          </Link>

          <Link
            to="/admin/locations"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 shadow-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              {t('location_hierarchy', 'Locations')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {t('woredas_kebeles', 'Regions & Kebeles')}
            </p>
          </Link>

          <Link
            to="/admin/officers"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 shadow-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              {t('officer_assignments', 'Assignments')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {t('officer_jurisdictions', 'Officer Coverage')}
            </p>
          </Link>

          <Link
            to="/admin/crop-types"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-200 shadow-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              {t('crop_management', 'Crops')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {t('crop_specializations', 'Types & Mapping')}
            </p>
          </Link>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            {t('recent_system_activity', 'Recent System Activity')}
          </h2>
          <Link
            to="/admin/activity"
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <span>{t('view_audit_log', 'Audit Log')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 divide-y divide-slate-100 dark:divide-zinc-800/80">
          {activity.length > 0 ? (
            activity.map((item, i) => {
              let parsedTitle = item.title;
              let parsedDesc = item.desc;

              if (item.title === 'New User Registered') {
                parsedTitle = t('notif_new_user', 'New User Registered');
              }
              if (item.desc && item.desc.includes('joined as')) {
                const parts = item.desc.split(' joined as ');
                if (parts.length === 2) {
                  parsedDesc = parts[0] + " " + t('notif_joined_as', 'joined as') + " " + parts[1];
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
            <div className="py-16 text-center text-slate-500 dark:text-zinc-400 text-sm">
              <Activity className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="font-semibold">{t('no_recent_activity', 'No recent activity.')}</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                {t('activity_logs_will_appear', 'System events and user activities will be displayed here.')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, time, type }) {
  const badgeConfig = {
    danger: { dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50' },
    success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
    info: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' },
  };

  const currentBadge = badgeConfig[type] || badgeConfig.info;

  return (
    <div className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
      <div className="mt-1 flex items-center justify-center shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full ${currentBadge.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{title}</p>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">{time}</span>
        </div>
        {desc && (
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
            {desc}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;