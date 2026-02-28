'use client';

export function LuxuryShopSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 shadow-xl">
      {/* Shimmer Effect - Silk-like */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      
      {/* Hero Banner Skeleton */}
      <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-100" />

      {/* Content Skeleton */}
      <div className="relative p-6 space-y-4">
        {/* Logo Skeleton */}
        <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl bg-white shadow-xl border-4 border-white" />

        {/* Name Skeleton */}
        <div className="mt-12 space-y-3">
          <div className="h-7 w-3/4 bg-gray-200 rounded-lg" />
          
          {/* Location Skeleton */}
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          
          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 rounded" />
          </div>

          {/* Button Skeleton */}
          <div className="pt-4">
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
