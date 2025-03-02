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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
          >
            {/* Image Skeleton */}
            <div className="aspect-[4/3] bg-gray-200 animate-pulse" />

            {/* Content Skeleton */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-6 w-1/3 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="h-11 w-full bg-gray-200 rounded-2xl animate-pulse" />
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