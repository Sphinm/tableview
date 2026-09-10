import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-36 bg-slate-900 rounded-full" />
        <div className="h-10 w-3/4 sm:w-1/2 bg-slate-900 rounded-2xl" />
        <div className="h-4 w-5/6 sm:w-2/3 bg-slate-900/60 rounded-lg" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="h-5 w-40 bg-slate-800 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-950 rounded-xl border border-slate-800" />
              <div className="h-12 bg-slate-950 rounded-xl border border-slate-800" />
            </div>
            <div className="h-12 bg-slate-950 rounded-xl border border-slate-800" />
            <div className="h-12 bg-slate-950 rounded-xl border border-slate-800" />
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="h-6 w-32 bg-slate-800 rounded" />
            <div className="h-16 bg-slate-950 rounded-xl border border-slate-800" />
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-slate-800/60 rounded" />
              <div className="h-4 bg-slate-800/60 rounded" />
              <div className="h-4 bg-slate-800/60 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
