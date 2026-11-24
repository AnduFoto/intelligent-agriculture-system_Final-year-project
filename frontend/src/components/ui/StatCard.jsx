import React from 'react';

export default function StatCard({ title, value, icon, trend, trendValue, subtitle, className = '' }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-6 shadow-soft dark:shadow-2xl transition-all hover:shadow-lg dark:hover:shadow-primary-900/10 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'} flex items-center`}>
                {trend === 'up' ? (
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
                ) : (
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                )}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-500">
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-500/30 flex items-center justify-center shrink-0">
            <div className="text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
