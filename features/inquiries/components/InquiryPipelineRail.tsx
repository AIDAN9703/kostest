"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Snowflake } from "lucide-react";

import { updateInquiryStage } from "@/features/inquiries/inquiry.actions";
import { AssignInquiryMenu } from "./AssignInquiryMenu";
import { ClaimInquiryButton } from "./ClaimInquiryButton";
import {
  adminDisplayName,
  adminInitials,
  type AdminOption,
} from "@/features/inquiries/inquiry-ui";
import type { InquiryAssignee } from "@/features/inquiries/inquiry.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

const PIPELINE_STAGES = [
  { value: "NEW", label: "New" },
  { value: "CLAIMED", label: "Claimed" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "OFFER_SENT", label: "Offer sent" },
  { value: "CONVERTED", label: "Converted" },
] as const;

/** Legacy NEEDS_CONTACT is displayed and treated as NEW. */
function normalizeStage(stage: string) {
  return stage === "NEEDS_CONTACT" ? "NEW" : stage;
}

interface InquiryPipelineRailProps {
  inquiryId: string;
  stage: string;
  outcome: string;
  assignee: InquiryAssignee | null;
  admins: AdminOption[];
}

export function InquiryPipelineRail({
  inquiryId,
  stage,
  outcome,
  assignee,
  admins,
}: InquiryPipelineRailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const current = normalizeStage(stage);
  const isOpen = outcome === "OPEN";
  const isCold = current === "COLD";
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.value === current);

  async function setStage(newStage: string) {
    if (!isOpen || pending || newStage === current) return;
    setPending(true);
    const res = await updateInquiryStage(inquiryId, newStage);
    setPending(false);
    if (res.success) {
      router.refresh();
    } else {
      toast({ title: "Couldn't update stage", description: res.error, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Assignment */}
      <section>
        <h2 className="text-sm font-semibold">Assigned to</h2>
        <div className="flex items-center gap-3 pt-3">
          {assignee ? (
            <>
              <Avatar className="h-8 w-8 shrink-0">
                {assignee.profileImage ? (
                  <AvatarImage src={assignee.profileImage} alt={adminDisplayName(assignee)} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {adminInitials(adminDisplayName(assignee))}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {adminDisplayName(assignee)}
              </span>
            </>
          ) : (
            <span className="flex-1 text-sm font-medium text-red-600 dark:text-red-400">
              Unassigned
            </span>
          )}
          {!assignee && isOpen ? <ClaimInquiryButton inquiryId={inquiryId} /> : null}
          <AssignInquiryMenu
            inquiryId={inquiryId}
            admins={admins}
            currentAssigneeId={assignee?.id ?? null}
            triggerLabel={assignee ? "Reassign" : "Assign"}
          />
        </div>
      </section>

      {/* Pipeline stepper */}
      <section>
        <h2 className="text-sm font-semibold">Pipeline</h2>
        <ol className="relative flex flex-col pt-3">
          {/* connecting line */}
          <div className="absolute bottom-4 left-[9px] top-6 w-px bg-border/60" />
          {PIPELINE_STAGES.map((s, i) => {
            const isDone = !isCold && currentIndex > i;
            const isCurrent = !isCold && currentIndex === i;
            const isConverted = s.value === "CONVERTED";
            const clickable = isOpen && !isConverted && !pending && !isCurrent;
            return (
              <li key={s.value}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => setStage(s.value)}
                  title={
                    isConverted
                      ? "Set automatically when a booking is created from this lead"
                      : undefined
                  }
                  className={cn(
                    "group relative z-10 flex w-full items-center gap-3 rounded-lg px-0.5 py-2 text-left transition-colors",
                    clickable && "cursor-pointer hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
                      isDone && "border-brand bg-brand text-brand-foreground",
                      isCurrent && "border-brand bg-background ring-2 ring-brand/30",
                      !isDone && !isCurrent && "border-border bg-background"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      isCurrent
                        ? "font-semibold"
                        : isDone
                          ? "text-foreground"
                          : "text-muted-foreground",
                      isConverted && !isCurrent && "text-muted-foreground/60"
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Cold toggle */}
        {isOpen ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStage(isCold ? "NEW" : "COLD")}
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              isCold
                ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Snowflake className="h-3 w-3" />
            {isCold ? "Cold — click to revive" : "Mark cold"}
          </button>
        ) : null}
      </section>
    </div>
  );
}
