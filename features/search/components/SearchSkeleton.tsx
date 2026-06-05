export default function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Filter bar skeleton */}
      <div className="border-b border-gray-100 bg-white md:sticky md:top-[var(--header-h)] md:z-40">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-10 w-28 animate-pulse rounded-full bg-gray-100" />
          <div className="h-8 w-32 animate-pulse rounded-full bg-gray-100" />
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-2/3 max-w-lg animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 w-40 animate-pulse rounded-lg bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <div className="aspect-[3/2] animate-pulse rounded-xl bg-gray-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
