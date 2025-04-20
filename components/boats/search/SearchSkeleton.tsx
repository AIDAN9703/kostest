export default function SearchSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-white to-gray-50/50">
      {/* Top Filter Toggle Button Skeleton */}
      <div className="relative h-14 border-b border-gray-100 bg-white px-4 py-2">
        <div className="flex justify-end">
          <div className="h-10 w-40 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Side - Search Results */}
        <div className="w-full md:w-2/3 overflow-y-auto h-full">
          <div className="p-4 sm:p-4 lg:p-6 space-y-6 animate-fade-in">
            {/* Results Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="h-5 w-40 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-11 w-20 bg-gray-200 rounded-2xl animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-5 w-14 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-11 w-36 bg-gray-200 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>

            {/* Results Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                >
                  {/* Image Skeleton */}
                  <div className="aspect-[16/9] bg-gray-200 animate-pulse" />

                  {/* Content Skeleton */}
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-4 w-2/3 bg-gray-200 rounded-lg animate-pulse" />
                    </div>

                    <div className="flex justify-between items-center">
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
        </div>
        
        {/* Right Side - Map Skeleton (hidden on mobile) */}
        <div className="hidden md:block md:w-1/3 h-full">
          <div className="sticky top-0 h-full w-full bg-gray-200 animate-pulse">
            {/* Map Controls Skeleton */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="h-10 w-10 bg-white rounded-full shadow-md animate-pulse" />
              <div className="h-10 w-10 bg-white rounded-full shadow-md animate-pulse" />
            </div>
            
            {/* Search Area Button Skeleton */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="h-10 w-40 bg-white rounded-full shadow-md animate-pulse" />
            </div>
            
            {/* Map Attribution Skeleton */}
            <div className="absolute bottom-2 right-2">
              <div className="h-4 w-20 bg-white rounded-sm animate-pulse opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 