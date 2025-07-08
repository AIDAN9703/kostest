export default function BlogTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters Skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-[140px] h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-[140px] h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              </th>
              <th className="text-left p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
              </th>
              <th className="text-left p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              </th>
              <th className="text-left p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
              </th>
              <th className="text-left p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
              </th>
              <th className="text-left p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
              </th>
              <th className="text-right p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Table Row Skeletons */}
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-100">
                {/* Post Column */}
                <td className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-15 h-10 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                    </div>
                  </div>
                </td>

                {/* Status Column */}
                <td className="p-4">
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                </td>

                {/* Category Column */}
                <td className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </td>

                {/* Author Column */}
                <td className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                </td>

                {/* Date Column */}
                <td className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </td>

                {/* Views Column */}
                <td className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8" />
                </td>

                {/* Actions Column */}
                <td className="p-4">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
        <div className="flex items-center space-x-2">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
} 