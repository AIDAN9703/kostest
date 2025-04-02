export default function SearchSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Results Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-100"
          >
            {/* Image Skeleton - using wider 16:9 aspect ratio */}
            <div className="aspect-[16/9] bg-gray-200 animate-pulse" />

            {/* Content Skeleton - reduced height */}
            <div className="p-3 sm:p-4 space-y-3">
              <div className="space-y-1">
                <div className="h-5 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
} 