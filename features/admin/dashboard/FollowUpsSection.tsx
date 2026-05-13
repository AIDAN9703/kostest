import Link from "next/link";
import { SectionCard } from "@/shared/components/SectionCard";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { ChevronRight } from "lucide-react";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { formatDistanceToNowStrict } from "date-fns";

export function FollowUpsSection({
  inquiries,
  staleCount,
}: {
  inquiries: InquiryListItem[];
  staleCount: number;
}) {
  return (
    <SectionCard
      title="Follow-ups"
      subtitle="Open inquiries — quietest leads first so nothing slips"
      action={
        <div className="flex items-center gap-2">
          {staleCount > 0 && (
            <Badge variant="destructive" className="shrink-0">
              {staleCount} stale
            </Badge>
          )}
          <Button size="sm" variant="secondary" asChild>
            <Link href="/admin/inquiries">View all</Link>
          </Button>
        </div>
      }
    >
      <div className="flex-1 p-6">
        {inquiries.length === 0 ? (
          <EmptyState
            emoji="✅"
            title="Inbox clear"
            description="No open inquiries right now."
          />
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/admin/inquiries/${inquiry.id}`}
                className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/10 p-4 shadow-sm transition-all hover:bg-muted/30 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {inquiry.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {inquiry.message
                        ? inquiry.message.slice(0, 120) +
                          (inquiry.message.length > 120 ? "…" : "")
                        : inquiry.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={inquiry.stage} />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                    Updated{" "}
                    {formatDistanceToNowStrict(new Date(inquiry.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
