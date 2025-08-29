import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function InquiriesTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 bg-gray-50/70">
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">ID</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Customer</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Contact Info</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Details</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Status</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Date</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-gray-50/50 transition-colors">
              <TableCell className="px-3 py-2"><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell className="px-3 py-2">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </TableCell>
              <TableCell className="px-3 py-2"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="px-3 py-2"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
              <TableCell className="px-3 py-2"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="px-3 py-2 text-right"><Skeleton className="h-7 w-7 rounded-full ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 