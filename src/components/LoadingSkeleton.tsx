import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-36 rounded-2xl glass-panel border border-slate-800 p-5 space-y-3">
        <div className="h-6 bg-slate-800/80 rounded-lg w-1/4" />
        <div className="h-4 bg-slate-800/60 rounded-lg w-1/2" />
        <div className="h-10 bg-slate-800/40 rounded-xl w-full" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl glass-panel border border-slate-800 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-slate-800 rounded w-1/3" />
              <div className="h-5 bg-slate-800 rounded w-1/4" />
            </div>
            <div className="h-4 bg-slate-800/60 rounded w-3/4" />
            <div className="h-20 bg-slate-800/40 rounded-xl" />
            <div className="h-6 bg-slate-800/80 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};
