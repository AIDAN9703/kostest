import { Skeleton } from "@/shared/components/ui/skeleton";

export function UsersTableSkeleton() {
  // Create an array of 5 items for the skeleton rows
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-3 py-2 font-medium">User</th>
            <th className="px-3 py-2 font-medium w-[12%]">Role</th>
            <th className="px-3 py-2 font-medium w-[12%]">Status</th>
            <th className="px-3 py-2 font-medium w-[20%]">Email</th>
            <th className="px-3 py-2 font-medium w-[20%]">Phone Number</th>
            <th className="px-3 py-2 font-medium text-right w-[8%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {skeletonRows.map((index) => (
            <tr key={index}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
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
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-3 py-2">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-3 py-2 text-right">
                <Skeleton className="h-7 w-7 rounded-full ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 