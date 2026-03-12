import Link from "next/link";
import { SectionCard } from "@/shared/components/SectionCard";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { ChevronRight, Phone, Calendar, Users, DollarSign } from "lucide-react";
import type { InquiryListItem } from "@/features/inquiries/inquiry.types";
import { formatDate } from "@/shared/lib/utils/general-utils";

function formatInquiryDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function NewInquiriesTable({
  inquiries,
}: {
  inquiries: InquiryListItem[];
}) {
  return (
    <SectionCard
      title="New Inquiries"
      subtitle="Latest inbound site leads"
      action={
        <Button size="sm" variant="secondary" asChild>
          <Link href="/admin/inquiries">View all</Link>
        </Button>
      }
    >
      <div className="flex-1 p-6">
        {inquiries.length === 0 ? (
          <EmptyState
            emoji="📩"
            title="No inquiries yet"
            description="New inquiries from the site will appear here."
          />
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/admin/inquiries/${inquiry.id}`}
                className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/10 p-4 shadow-sm transition-all hover:shadow-md hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {inquiry.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {inquiry.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={inquiry.stage} />
                    <StatusBadge status={inquiry.outcome} />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(inquiry.createdAt)}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                {(inquiry.phone ||
                  inquiry.date ||
                  inquiry.guests ||
                  inquiry.budget) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {inquiry.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {inquiry.phone}
                      </span>
                    )}
                    {inquiry.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatInquiryDate(inquiry.date)}
                      </span>
                    )}
                    {inquiry.guests != null && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {inquiry.guests} guests
                      </span>
                    )}
                    {inquiry.budget && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {inquiry.budget}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
