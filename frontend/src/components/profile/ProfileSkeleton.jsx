import React from 'react';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-zinc-700 shrink-0"></div>
          <div className="flex-1 space-y-4 text-center sm:text-left w-full">
            <div className="h-6 bg-slate-200 dark:bg-zinc-700 rounded w-1/3 mx-auto sm:mx-0"></div>
            <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-1/4 mx-auto sm:mx-0"></div>
            <div className="flex gap-2 justify-center sm:justify-start">
              <div className="h-5 bg-slate-200 dark:bg-zinc-700 rounded w-16"></div>
              <div className="h-5 bg-slate-200 dark:bg-zinc-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-6 h-64"></div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-6 h-64"></div>
      </div>
    </div>
  );
}
