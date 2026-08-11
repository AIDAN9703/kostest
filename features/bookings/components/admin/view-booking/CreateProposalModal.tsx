"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ProposalForm } from "@/features/bookings/components/admin/booking-forms/ProposalForm";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";
import type { DealPrefill } from "@/features/bookings/lib/deal-prefill";

/**
 * "Create proposal" as a modal on the inquiry page — a purpose-built form
 * for pricing an inquiry (context strip of what was asked, boat/dates/
 * contact prefilled, no account picker), hosted in a dialog so the admin
 * never leaves the deal. Same createBookings upgrade action as the
 * /admin/bookings/create page. On success the deal row itself upgrades to
 * a priced DRAFT, so we just close and refresh this page.
 */
export function CreateProposalModal({
  pricingTiers,
  dealPrefill,
}: {
  pricingTiers: PricingTierOption[];
  dealPrefill: DealPrefill;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button size="sm" className="shrink-0 gap-1.5 rounded-full px-4" onClick={() => setOpen(true)}>
        <CalendarPlus className="h-3.5 w-3.5" />
        Create proposal
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              New proposal for {dealPrefill.customerName || "this lead"}
            </DialogTitle>
            <DialogDescription>
              Pick the boat, set the price, and send it — the customer accepts and pays from
              their link.
            </DialogDescription>
          </DialogHeader>
          <ProposalForm
            pricingTiers={pricingTiers}
            dealPrefill={dealPrefill}
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
