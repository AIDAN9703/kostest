"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBookingsAction } from "@/features/bookings/actions/create-bookings.actions";
import type { ActionResponse } from "@/shared/lib/types/types";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { ToastAction } from "@/shared/components/ui/toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { AddOnsFields } from "@/features/bookings/components/admin/booking-forms/shared/AddOnsFields";
import { BookingSectionFields } from "@/features/bookings/components/admin/booking-forms/shared/BookingSectionFields";
import { DraftOptionsSidebar } from "@/features/bookings/components/admin/booking-forms/shared/DraftOptionsSidebar";
import {
  buildSectionPreview,
  groupTiersByBoat,
} from "@/features/bookings/components/admin/booking-forms/shared/pricing";

import {
  createEmptyBookingSection,
  type BookingSectionData,
  type PricingTierOption,
} from "./types";
import type { BookingAddOnInput } from "@/features/bookings/booking.types";
import type { DealPrefill } from "@/features/bookings/lib/deal-prefill";

interface ProposalFormProps {
  pricingTiers: PricingTierOption[];
  /** The inquiry being priced — always present; this form exists only for
   *  the inquiry → proposal upgrade. */
  dealPrefill: DealPrefill;
  /** Called after a successful create — lets the hosting modal close/refresh. */
  onSuccess?: (bookingId?: string) => void;
}

const INITIAL_STATE: ActionResponse<{
  bookingIds: string[];
  publicToken: string | null;
  groupId: string | null;
  proposalSent?: boolean;
}> = { success: false };

/**
 * The inquiry-to-proposal form: everything the customer told us is
 * prefilled (contact, boat + default tier, dates, guests, notes), so the
 * admin's job collapses to confirm the boat, set the price, send. No
 * existing-vs-guest account picker — an inquiry is a guest by definition
 * (the booking keeps its own contact snapshot; account linking is a
 * separate concern).
 *
 * Submits the same createBookingsAction with dealId, so the inquiry row
 * itself upgrades — identical backend path to /admin/bookings/create.
 */
export function ProposalForm({ pricingTiers, dealPrefill, onSuccess }: ProposalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [actionState, setActionState] = useState(INITIAL_STATE);

  const tiersByBoat = useMemo(() => groupTiersByBoat(pricingTiers), [pricingTiers]);

  const [customerName, setCustomerName] = useState(dealPrefill.customerName);
  const [customerEmail, setCustomerEmail] = useState(dealPrefill.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(dealPrefill.customerPhone);
  const [numberOfPassengers, setNumberOfPassengers] = useState(dealPrefill.numberOfPassengers);

  // Boat + default tier come pre-resolved when the inquiry named a boat.
  const [section, setSection] = useState<BookingSectionData>(() => {
    const base = createEmptyBookingSection();
    const boatTiers = dealPrefill.boatId
      ? pricingTiers.filter((t) => t.boatId === dealPrefill.boatId)
      : [];
    const defaultTier = boatTiers.find((t) => t.isDefault) ?? boatTiers[0] ?? null;
    return {
      ...base,
      boatId: dealPrefill.boatId,
      usePricingTier: Boolean(defaultTier),
      pricingTierId: defaultTier?.id ?? "",
      basePrice: defaultTier?.price ?? 0,
      startDateTime: dealPrefill.startDateTime,
      endDateTime: dealPrefill.endDateTime,
    };
  });

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [adminNotes, setAdminNotes] = useState(dealPrefill.adminNotes);
  const [lineItems, setLineItems] = useState<BookingAddOnInput[]>([]);

  const [allowPayment, setAllowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<"DEPOSIT_ONLY" | "FULL_PAYMENT">("FULL_PAYMENT");
  // Coming from a lead, the point is to SEND — default the channels on
  // (SMS only with consent) instead of silently saving a draft.
  const [sendProposalEmail, setSendProposalEmail] = useState(
    Boolean(dealPrefill.customerEmail)
  );
  const [sendProposalSms, setSendProposalSms] = useState(
    dealPrefill.smsConsent && Boolean(dealPrefill.customerPhone)
  );

  const preview = useMemo(
    () => [
      buildSectionPreview(section, lineItems, pricingTiers, dealPrefill.boatName ?? "Boat"),
    ],
    [section, lineItems, pricingTiers, dealPrefill.boatName]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const payload = [
        {
          boatId: section.boatId,
          usePricingTier: section.usePricingTier,
          pricingTierId: section.usePricingTier ? section.pricingTierId || null : null,
          basePrice: section.basePrice,
          depositAmount: section.depositAmount ?? null,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          userId: null,
          startDateTime: section.startDateTime,
          endDateTime: section.endDateTime || null,
        },
      ];

      const formData = new FormData();
      formData.set("dealId", dealPrefill.dealId);
      formData.set("bookings", JSON.stringify(payload));
      formData.set("lineItems", JSON.stringify(lineItems));
      formData.set("numberOfPassengers", String(numberOfPassengers));
      formData.set("pickupLocation", pickupLocation);
      formData.set("dropoffLocation", dropoffLocation);
      formData.set("adminNotes", adminNotes);
      formData.set("allowPayment", allowPayment ? "on" : "");
      formData.set("paymentType", paymentType);
      formData.set("sendProposalEmail", sendProposalEmail ? "on" : "");
      formData.set("sendProposalSms", sendProposalSms ? "on" : "");

      startTransition(async () => {
        const result = await createBookingsAction(INITIAL_STATE, formData);
        setActionState(result);
        if (result.success) {
          const bookingId = result.data?.bookingIds?.[0];
          toast({
            title: "Proposal created.",
            description: result.data?.proposalSent
              ? "Proposal sent to the customer."
              : "Saved as a draft proposal.",
            variant: "success",
            action: bookingId ? (
              <ToastAction asChild altText="View booking">
                <Link href={`/admin/bookings/${bookingId}`}>View booking</Link>
              </ToastAction>
            ) : undefined,
          });
          // Modal host closes/refreshes; the standalone create page jumps
          // to the upgraded deal instead.
          if (onSuccess) onSuccess(bookingId);
          else if (bookingId) router.push(`/admin/bookings/${bookingId}`);
        } else if (result.error) {
          toast({ title: "Error", description: result.error, variant: "destructive" });
        }
      });
    },
    [
      toast,
      customerName,
      customerEmail,
      customerPhone,
      section,
      numberOfPassengers,
      pickupLocation,
      dropoffLocation,
      adminNotes,
      lineItems,
      allowPayment,
      paymentType,
      sendProposalEmail,
      sendProposalSms,
      dealPrefill.dealId,
      onSuccess,
      router,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <Card className="gap-3 rounded-2xl border-border/60 py-5">
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input
                    type="number"
                    min={1}
                    value={numberOfPassengers}
                    onChange={(e) => setNumberOfPassengers(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Visible to staff only"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>




          <Card className="gap-3 rounded-2xl border-border/60 py-5">
            <CardHeader>
              <CardTitle className="text-lg">Charter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BookingSectionFields
                section={section}
                onChange={(u) => setSection((s) => ({ ...s, ...u }))}
                pricingTiers={pricingTiers}
                tiersByBoat={tiersByBoat}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Pickup Location</Label>
                  <Input
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Marina / dock"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dropoff Location</Label>
                  <Input
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <AddOnsFields lineItems={lineItems} onChange={setLineItems} />
            </CardContent>
          </Card>
        </div>

        <DraftOptionsSidebar
          preview={preview}
          allowPayment={allowPayment}
          onAllowPaymentChange={setAllowPayment}
          paymentType={paymentType}
          onPaymentTypeChange={setPaymentType}
          sendProposalEmail={sendProposalEmail}
          onSendProposalEmailChange={setSendProposalEmail}
          sendProposalSms={sendProposalSms}
          onSendProposalSmsChange={setSendProposalSms}
          submitLabel={
            sendProposalEmail || sendProposalSms ? "Create & send proposal" : "Save draft proposal"
          }
          isPending={pending}
          error={actionState.error}
        />
      </div>
    </form>
  );
}
