import Link from "next/link";
import { SectionCard } from "@/shared/components/SectionCard";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { ChevronRight } from "lucide-react";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/shared/lib/utils/general-utils";

function messagePreview(inquiry: InquiryListItem, maxLen: number) {
  if (!inquiry.message) return inquiry.email;
  return inquiry.message.slice(0, maxLen) + (inquiry.message.length > maxLen ? "…" : "");
}

export function FollowUpsSection({
  inquiries,
  compact = false,
  className,
}: {
  inquiries: InquiryListItem[];
  compact?: boolean;
  className?: string;
}) {
  const list =
    inquiries.length === 0 ? (
      <EmptyState
        emoji="✅"
        title="Inbox clear"
        description="No open inquiries right now."
      />
    ) : compact ? (
      <div className="divide-y divide-border/60 space-y-0">
        {inquiries.map((inquiry) => (
          <Link
            key={inquiry.id}
            href={`/admin/inquiries/${inquiry.id}`}
            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/20 -mx-2 px-2 rounded-xl"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate font-medium text-foreground">{inquiry.name}</p>
              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                {messagePreview(inquiry, 140)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
              <StatusBadge status={inquiry.stage} />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(new Date(inquiry.updatedAt), { addSuffix: true })}
              </span>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
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
                <p className="truncate font-semibold text-foreground">{inquiry.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {messagePreview(inquiry, 120)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <StatusBadge status={inquiry.stage} />
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                Updated{" "}
                {formatDistanceToNowStrict(new Date(inquiry.updatedAt), { addSuffix: true })}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    );

  return (
    <SectionCard
      className={cn("h-full min-h-0 min-w-0 max-h-full flex-1", className)}
      title="Follow-ups"
      subtitle="Open inquiries — quietest leads first so nothing slips"
      action={
        <Button size="sm" variant="secondary" asChild>
          <Link href="/admin/inquiries">View all</Link>
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 [scrollbar-gutter:stable]">
          {list}
        </div>
      </div>
    </SectionCard>
  );
}
