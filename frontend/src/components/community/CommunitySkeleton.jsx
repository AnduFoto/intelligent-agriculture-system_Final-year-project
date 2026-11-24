import React from 'react';

export const CommunitySkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
            </div>
          </div>
          <div className="space-y-2 py-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6"></div>
          </div>
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
        </div>
      ))}
    </div>
  );
};

export default CommunitySkeleton;
