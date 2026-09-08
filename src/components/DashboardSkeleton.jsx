import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-10 bg-amber-100/50 rounded-2xl w-full" />

      {/* Hero Holding Card Skeleton */}
      <div className="rounded-3xl bg-amber-50/60 border-2 border-amber-200/50 p-6 sm:p-8 h-48 flex flex-col justify-between">
        <div className="h-4 bg-amber-200/60 rounded-full w-40" />
        <div className="h-12 bg-amber-200/80 rounded-2xl w-64 my-2" />
        <div className="h-4 bg-amber-200/50 rounded-full w-72" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-3xl bg-emerald-50/40 border border-emerald-100 p-6 h-32 flex flex-col justify-between">
          <div className="h-3 bg-emerald-200/60 rounded-full w-28" />
          <div className="h-8 bg-emerald-200/80 rounded-xl w-40" />
        </div>
        <div className="rounded-3xl bg-rose-50/40 border border-rose-100 p-6 h-32 flex flex-col justify-between">
          <div className="h-3 bg-rose-200/60 rounded-full w-28" />
          <div className="h-8 bg-rose-200/80 rounded-xl w-40" />
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="rounded-3xl bg-white border border-amber-100 p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded-full w-36" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-amber-50/60 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
