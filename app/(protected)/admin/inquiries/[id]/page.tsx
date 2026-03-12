import { inquiryService } from "@/features/inquiries/inquiry.service";
import { InquiryProfileHeader } from "@/features/inquiries/components/InquiryProfileHeader";
import { InquiryContactInfo } from "@/features/inquiries/components/InquiryContactInfo";
import { InquiryDetails } from "@/features/inquiries/components/InquiryDetails";
import { InquiryTimeline } from "@/features/inquiries/components/InquiryTimeline";
import { InquiryActions } from "@/features/inquiries/components/InquiryActions";
import { InquiryCloseActions } from "@/features/inquiries/components/InquiryCloseActions";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { InquiryEvent } from "@/database/types";

interface InquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 30;

export default async function InquiryDetailPage({
  params,
}: InquiryDetailPageProps) {
  const resolvedParams = await params;
  const inquiryId = resolvedParams.id;

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <Suspense fallback={<InquiryDetailSkeleton />}>
        <InquiryDetail inquiryId={inquiryId} />
      </Suspense>
    </div>
  );
}

async function InquiryDetail({ inquiryId }: { inquiryId: string }) {
  const inquiry = await inquiryService.getInquiryById(inquiryId);

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header Card */}
      <div className="h-full flex flex-col overflow-hidden bg-card rounded-3xl border border-border shadow-xs">
        <div className="p-6 space-y-6">
          <InquiryProfileHeader inquiry={inquiry} />
          <InquiryCloseActions
            inquiryId={inquiry.id}
            currentOutcome={inquiry.outcome}
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InquiryContactInfo inquiry={inquiry} />
        <InquiryDetails inquiry={inquiry} />
      </div>

      {/* Timeline - full width */}
      <InquiryTimeline
        events={inquiry.events as InquiryEvent[]}
        actions={
          <InquiryActions
            inquiryId={inquiry.id}
            currentStage={inquiry.stage}
            currentOutcome={inquiry.outcome}
          />
        }
      />
    </div>
  );
}

function InquiryDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-[140px] rounded-3xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
      <Skeleton className="h-[320px] rounded-xl" />
    </div>
  );
}
