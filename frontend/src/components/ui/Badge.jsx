import React from 'react';

const BADGE_VARIANTS = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  default: 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-300',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}
