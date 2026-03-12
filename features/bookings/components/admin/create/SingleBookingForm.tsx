"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createBookingsAction } from "@/features/bookings/actions/create-bookings.actions";
import type { CreateBookingsResponse } from "@/features/bookings/actions/create-bookings.actions";
import { useUser } from "@/features/users/hooks/useUsers";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { CustomerFields } from "./CustomerFields";
import { AddOnsFields } from "./AddOnsFields";
import { BookingSectionFields } from "./BookingSectionFields";
import { DraftOptionsSidebar } from "./DraftOptionsSidebar";
import {
  createEmptyBookingSection,
  type BookingSectionData,
  type LineItemInput,
  type PricingTierOption,
  type InquiryPrefill,
} from "./types";

interface SingleBookingFormProps {
  pricingTiers: PricingTierOption[];
  inquiryId?: string;
  inquiryPrefill?: InquiryPrefill;
}

const INITIAL_STATE: CreateBookingsResponse = { success: false };

export function SingleBookingForm({
  pricingTiers,
  inquiryId,
  inquiryPrefill,
}: SingleBookingFormProps) {
  const [pending, startTransition] = useTransition();
  const [actionState, setActionState] = useState<CreateBookingsResponse>(INITIAL_STATE);

  const [customerType, setCustomerType] = useState<"existing_user" | "guest">("existing_user");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [customerName, setCustomerName] = useState(inquiryPrefill?.customerName ?? "");
  const [customerEmail, setCustomerEmail] = useState(inquiryPrefill?.customerEmail ?? "");
  const [customerPhone, setCustomerPhone] = useState(inquiryPrefill?.customerPhone ?? "");
  const [numberOfPassengers, setNumberOfPassengers] = useState(inquiryPrefill?.numberOfPassengers ?? 6);

  const [section, setSection] = useState<BookingSectionData>(createEmptyBookingSection);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState(inquiryPrefill?.specialRequests ?? "");
  const [adminNotes, setAdminNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemInput[]>([]);

  const [expiresAt, setExpiresAt] = useState("");
  const [allowPayment, setAllowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<"DEPOSIT_ONLY" | "FULL_PAYMENT">("FULL_PAYMENT");

  const { data: selectedUser } = useUser(selectedUserId || "");

  useEffect(() => {
    if (customerType === "existing_user" && selectedUser && selectedUserId) {
      const fullName = `${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim();
      setCustomerName(fullName || selectedUser.email);
      setCustomerEmail(selectedUser.email);
      setCustomerPhone(selectedUser.phoneNumber ?? "");
    } else if (!selectedUserId) {
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
      if (customerType === "existing_user" && !selectedUserId) {
        setActionState({ success: false, error: "Please select or create a user." });
        return;
      }
      if (!customerName.trim() || !customerEmail.trim()) {
        setActionState({ success: false, error: "Customer name and email are required." });
        return;
      }
      if (!section.boatId) {
        setActionState({ success: false, error: "Please select a boat." });
        return;
      }
      if (section.usePricingTier && !section.pricingTierId) {
        setActionState({ success: false, error: "Please select a pricing tier or switch to custom pricing." });
        return;
      }
      if (!section.usePricingTier && (section.basePrice <= 0 || !section.endDateTime)) {
        setActionState({ success: false, error: "Custom pricing requires base price and end date & time." });
        return;
      }
      if (!section.startDateTime) {
        setActionState({ success: false, error: "Please select start date and time." });
        return;
      }

      const payload = [
        {
          boatId: section.boatId,
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
      formData.set("specialRequests", specialRequests);
      formData.set("adminNotes", adminNotes);
      formData.set("allowPayment", allowPayment ? "on" : "");
      formData.set("paymentType", paymentType);
      formData.set("expiresAt", expiresAt);
      if (inquiryId) formData.set("inquiryId", inquiryId);

      startTransition(async () => {
        const result = await createBookingsAction(INITIAL_STATE, formData);
        setActionState(result);
        if (result.success) {
          setSection(createEmptyBookingSection());
          setCustomerName("");
          setCustomerEmail("");
          setCustomerPhone("");
          setSelectedUserId("");
          setLineItems([]);
        }
      });
    },
    [
      customerType,
      selectedUserId,
      customerName,
      customerEmail,
      customerPhone,
      section,
      numberOfPassengers,
      pickupLocation,
      dropoffLocation,
      specialRequests,
      adminNotes,
      lineItems,
      allowPayment,
      paymentType,
      expiresAt,
      inquiryId,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {inquiryId && <input type="hidden" name="inquiryId" value={inquiryId} />}
      {actionState.success && (
        <Card className="rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-emerald-800">Booking created successfully.</p>
            <p className="mt-1 text-xs text-emerald-700">
              A proposal has been sent to the customer&apos;s email and phone.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-6 pt-6">
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

          <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <BookingSectionFields
                section={section}
                onChange={(u) => setSection((s) => ({ ...s, ...u }))}
                pricingTiers={pricingTiers}
                tiersByBoat={tiersByBoat}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-6 pt-6">
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
                <Label>Special Requests</Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Notes for the crew"
                  rows={2}
                />
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
          expiresAt={expiresAt}
          onExpiresAtChange={setExpiresAt}
          submitLabel="Create Booking"
          isPending={pending}
          error={actionState.error}
        />
      </div>
    </form>
  );
}
