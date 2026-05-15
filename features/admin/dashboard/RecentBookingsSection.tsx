import Link from "next/link";
import { SectionCard } from "@/shared/components/SectionCard";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import type { BookingListItem } from "@/features/bookings/booking.types";
import { cn } from "@/shared/lib/utils/general-utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function displayGmvCents(b: BookingListItem): number {
  const ops = b.opsGmvCents;
  if (ops != null && ops > 0) return ops;
  return b.totalAmountCents ?? 0;
}

export function RecentBookingsSection({
  bookings,
  className,
}: {
  bookings: BookingListItem[];
  className?: string;
}) {
  return (
    <SectionCard
      className={cn("h-full min-h-0 min-w-0 max-h-full flex-1", className)}
      title="Recent bookings"
      subtitle="Latest bookings added — amounts use ops GMV when set, otherwise quote total"
      action={
        <Button size="sm" variant="secondary" asChild>
          <Link href="/admin/bookings">View all</Link>
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 [scrollbar-gutter:stable]">
          {bookings.length === 0 ? (
            <EmptyState
              emoji="📋"
              title="No bookings yet"
              description="New bookings will appear here as they are created."
            />
          ) : (
            <div className="space-y-0 divide-y divide-border/60">
              {bookings.map((booking) => {
                const gmv = displayGmvCents(booking);
                const when = format(new Date(booking.startDateTime), "MMM d, yyyy");
                return (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/20 -mx-2 px-2 rounded-xl"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                      {initials(booking.customerName ?? "?")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {booking.customerName ?? "Unknown"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {booking.boatName ?? "—"} · {when}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatCentsAsCurrency(gmv)}
                      </span>
                      <StatusBadge status={booking.paymentDisplayStatus} />
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
