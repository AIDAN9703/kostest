import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-gray-50/70">
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">ID</TableHead>
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Customer</TableHead>
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Boat</TableHead>
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Dates</TableHead>
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Status</TableHead>
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Amount</TableHead>
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Payment</TableHead>
              <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="px-3 py-2">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell className="px-3 py-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Skeleton className="h-6 w-14 rounded-full" />
                </TableCell>
                <TableCell className="px-3 py-2 text-right">
                  <Skeleton className="h-7 w-7 rounded-full ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
} 