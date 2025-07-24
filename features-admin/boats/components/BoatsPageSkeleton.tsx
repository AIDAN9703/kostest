import { Skeleton } from "@/shared/components/ui/skeleton";

export function BoatsPageSkeleton() {
  // Create an array of 5 items for the skeleton rows
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-16" /> {/* Title */}
          <Skeleton className="h-4 w-40 mt-1" /> {/* Subtitle */}
        </div>
        <Skeleton className="h-9 w-24" /> {/* Add button */}
      </div>
      
      {/* Filter Bar Skeleton */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-9 flex-1" /> {/* Search input */}
          <Skeleton className="h-9 w-full sm:w-[180px]" /> {/* Category select */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" /> {/* Active button */}
            <Skeleton className="h-9 w-24" /> {/* Featured button */}
          </div>
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-3 py-2 font-medium">Boat</th>
              <th className="px-3 py-2 font-medium w-[12%]">Category</th>
              <th className="px-3 py-2 font-medium w-[12%]">Status</th>
              <th className="px-3 py-2 font-medium w-[15%]">Price</th>
              <th className="px-3 py-2 font-medium w-[12%]">Capacity</th>
              <th className="px-3 py-2 font-medium text-right w-[8%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {skeletonRows.map((index) => (
              <tr key={index}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-3 py-2">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-3 py-2 text-right">
                  <Skeleton className="h-7 w-7 rounded-full ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 