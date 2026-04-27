import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AllPageLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:px-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="border-b border-border/60 p-4">
          <div className="flex gap-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-6 w-20" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
