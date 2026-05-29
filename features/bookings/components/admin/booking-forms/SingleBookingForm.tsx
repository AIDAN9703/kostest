"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import Link from "next/link";

import { createBookingsAction } from "@/features/bookings/actions/create-bookings.actions";
import type { ActionResponse } from "@/shared/lib/types/types";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { ToastAction } from "@/shared/components/ui/toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { CustomerFields } from "@/features/bookings/components/admin/booking-forms/shared/CustomerFields";
import { AddOnsFields } from "@/features/bookings/components/admin/booking-forms/shared/AddOnsFields";
import { BookingSectionFields } from "@/features/bookings/components/admin/booking-forms/shared/BookingSectionFields";
import { DraftOptionsSidebar } from "@/features/bookings/components/admin/booking-forms/shared/DraftOptionsSidebar";
import { useUser } from "@/features/users/hooks/useUsers";

import {
  createEmptyBookingSection,
  type BookingSectionData,
  type PricingTierOption,
} from "./types";
import type { BookingAddOnInput } from "@/features/bookings/booking.types";
import type { InquiryBookingPrefill } from "@/features/inquiries/inquiry-booking-prefill";
import type { BookingDatePrefill } from "@/features/bookings/lib/booking-create-date-prefill";

interface SingleBookingFormProps {
  pricingTiers: PricingTierOption[];
  /** When opening from an inquiry (won → create booking) */
  inquiryPrefill?: InquiryBookingPrefill | null;
  /** When opening from admin calendar (`?date=YYYY-MM-DD`) */
  datePrefill?: BookingDatePrefill | null;
}

const INITIAL_STATE: ActionResponse<{
  bookingIds: string[];
  publicToken: string | null;
  groupId: string | null;
  proposalSent?: boolean;
}> = { success: false };

export function SingleBookingForm({
  pricingTiers,
  inquiryPrefill = null,
  datePrefill = null,
}: SingleBookingFormProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [actionState, setActionState] = useState<
    ActionResponse<{
      bookingIds: string[];
      publicToken: string | null;
      groupId: string | null;
      proposalSent?: boolean;
    }>
  >(INITIAL_STATE);

  const [customerType, setCustomerType] = useState<"existing_user" | "guest">("existing_user");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfPassengers, setNumberOfPassengers] = useState(6);

  const [section, setSection] = useState<BookingSectionData>(createEmptyBookingSection);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [lineItems, setLineItems] = useState<BookingAddOnInput[]>([]);

  const [allowPayment, setAllowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<"DEPOSIT_ONLY" | "FULL_PAYMENT">("FULL_PAYMENT");
  const [sendProposalEmail, setSendProposalEmail] = useState(false);
  const [sendProposalSms, setSendProposalSms] = useState(false);

  const { data: selectedUser } = useUser(selectedUserId || "");

  const inquiryPrefillApplied = useRef(false);
  const datePrefillApplied = useRef(false);

  useEffect(() => {
    if (!datePrefill || datePrefillApplied.current || inquiryPrefill) return;
    datePrefillApplied.current = true;
    setSection((s) => ({
      ...s,
      startDateTime: datePrefill.startDateTime,
      endDateTime: datePrefill.endDateTime,
    }));
  }, [datePrefill, inquiryPrefill]);

  useEffect(() => {
    if (!inquiryPrefill || inquiryPrefillApplied.current) return;
    inquiryPrefillApplied.current = true;
    setCustomerType(inquiryPrefill.customerType);
    setSelectedUserId("");
    setCustomerName(inquiryPrefill.customerName);
    setCustomerEmail(inquiryPrefill.customerEmail);
    setCustomerPhone(inquiryPrefill.customerPhone);
    setNumberOfPassengers(inquiryPrefill.numberOfPassengers);
    if (inquiryPrefill.adminNotes.trim()) {
      setAdminNotes(inquiryPrefill.adminNotes);
    }
    setSection((s) => ({
      ...s,
      startDateTime: inquiryPrefill.startDateTime || s.startDateTime,
      endDateTime: inquiryPrefill.endDateTime || s.endDateTime,
    }));
  }, [inquiryPrefill]);

  useEffect(() => {
    if (customerType === "existing_user" && selectedUser && selectedUserId) {
      const fullName = `${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim();
      setCustomerName(fullName || selectedUser.email);
      setCustomerEmail(selectedUser.email);
      setCustomerPhone(selectedUser.phoneNumber ?? "");
    } else if (customerType === "existing_user" && !selectedUserId) {
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
    }
  }, [customerType, selectedUser, selectedUserId]);

  const tiersByBoat = useMemo(
    () =>
      pricingTiers.reduce<Record<string, PricingTierOption[]>>((acc, tier) => {
        if (!acc[tier.boatId]) acc[tier.boatId] = [];
        acc[tier.boatId].push(tier);
        return acc;
      }, {}),
    [pricingTiers]
  );

  const preview = useMemo(() => {
    const boat = section.boat;
    const tier = section.pricingTierId
      ? pricingTiers.find((t) => t.id === section.pricingTierId)
      : null;
    const basePrice = section.basePrice > 0 ? section.basePrice : (tier?.price ?? 0);
    const cleaningFee = boat?.cleaningFee ?? 0;
    const addOnsTotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const depositAmount =
      section.depositAmount != null && section.depositAmount >= 0
        ? section.depositAmount
        : (boat?.depositAmount ?? null);
    return [
      {
        name: boat?.name ?? "Boat",
        basePrice,
        cleaningFee,
        addOnsTotal,
        total: basePrice + cleaningFee + addOnsTotal,
        depositAmount,
      },
    ];
  }, [section, lineItems, pricingTiers]);

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
          userId: selectedUserId || null,
          startDateTime: section.startDateTime,
          endDateTime: section.endDateTime || null,
        },
      ];

      const formData = new FormData();
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
          const successDesc = result.data?.proposalSent
            ? "Proposal sent to customer."
            : "Booking saved as draft.";
          toast({
            title: "Booking created.",
            description: successDesc,
            variant: "success",
            action: bookingId ? (
              <ToastAction asChild altText="View booking">
                <Link href={`/admin/bookings/${bookingId}`}>View booking</Link>
              </ToastAction>
            ) : undefined,
          });
          setSection(createEmptyBookingSection());
          setCustomerName("");
          setCustomerEmail("");
          setCustomerPhone("");
          setSelectedUserId("");
          setLineItems([]);
        } else if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      });
    },
    [
      toast,
      selectedUserId,
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
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {inquiryPrefill ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-50">
          <span className="font-medium">Loaded from inquiry.</span> Customer and trip hints are
          filled below — choose a boat and pricing, then create the booking.
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pt-0 pb-6">
              <CustomerFields
                customerType={customerType}
                onCustomerTypeChange={setCustomerType}
                selectedUserId={selectedUserId}
                onSelectedUserIdChange={setSelectedUserId}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                customerEmail={customerEmail}
                onCustomerEmailChange={setCustomerEmail}
                customerPhone={customerPhone}
                onCustomerPhoneChange={setCustomerPhone}
                numberOfPassengers={numberOfPassengers}
                onNumberOfPassengersChange={setNumberOfPassengers}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg">Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pt-0 pb-6">
              <BookingSectionFields
                section={section}
                onChange={(u) => setSection((s) => ({ ...s, ...u }))}
                pricingTiers={pricingTiers}
                tiersByBoat={tiersByBoat}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pt-0 pb-6">
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
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Visible to staff only"
                  rows={2}
                />
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
          submitLabel="Create Booking"
          isPending={pending}
          error={actionState.error}
        />
      </div>
    </form>
  );
}
