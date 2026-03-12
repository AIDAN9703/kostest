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
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { CustomerFields } from "./CustomerFields";
import { AddOnsFields } from "./AddOnsFields";
import { BookingSectionFields } from "./BookingSectionFields";
import { DraftOptionsSidebar } from "./DraftOptionsSidebar";
import {
  createEmptyGroupSection,
  type GroupSectionData,
  type LineItemInput,
  type PricingTierOption,
} from "./types";

interface GroupBookingFormProps {
  pricingTiers: PricingTierOption[];
}

const INITIAL_STATE: CreateBookingsResponse = { success: false };

export function GroupBookingForm({ pricingTiers }: GroupBookingFormProps) {
  const [pending, startTransition] = useTransition();
  const [actionState, setActionState] = useState<CreateBookingsResponse>(INITIAL_STATE);

  const [customerType, setCustomerType] = useState<"existing_user" | "guest">("existing_user");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfPassengers, setNumberOfPassengers] = useState(6);

  const [sections, setSections] = useState<GroupSectionData[]>(() => [createEmptyGroupSection()]);
  const [groupName, setGroupName] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
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

  const firstSection = sections[0];
  const sharedStart = firstSection?.startDateTime ?? "";
  const sharedEnd = firstSection?.endDateTime ?? "";

  const resolvePayload = useCallback(() => {
    return sections.map((section, index) => {
      const customer =
        index === 0 || section.sameUserAsAbove
          ? { customerName, customerEmail, customerPhone: customerPhone || null, userId: selectedUserId || null }
          : {
              customerName: section.customerName,
              customerEmail: section.customerEmail,
              customerPhone: section.customerPhone || null,
              userId: section.userId || null,
            };
      const dates =
        index === 0 || section.sameAsFirstBooking
          ? { startDateTime: sharedStart, endDateTime: sharedEnd || null }
          : {
              startDateTime: section.startDateTime,
              endDateTime: section.endDateTime || null,
            };
      return {
        boatId: section.boatId,
        pricingTierId: section.usePricingTier ? section.pricingTierId || null : null,
        basePrice: section.basePrice,
        depositAmount: section.depositAmount ?? null,
        ...customer,
        ...dates,
      };
    });
  }, [sections, customerName, customerEmail, customerPhone, selectedUserId, sharedStart, sharedEnd]);

  const preview = useMemo(() => {
    return sections.map((section, idx) => {
      const boat = section.boat;
      const tier = section.pricingTierId
        ? pricingTiers.find((t) => t.id === section.pricingTierId)
        : null;
      const basePrice = section.basePrice > 0 ? section.basePrice : (tier?.price ?? 0);
      const cleaningFee = boat?.cleaningFee ?? 0;
      const addOnsTotal =
        idx === 0 ? lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) : 0;
      const depositAmount =
        section.depositAmount != null && section.depositAmount >= 0
          ? section.depositAmount
          : (boat?.depositAmount ?? null);
      return {
        name: boat?.name ?? "Boat",
        basePrice,
        cleaningFee,
        addOnsTotal,
        total: basePrice + cleaningFee + addOnsTotal,
        depositAmount,
      };
    });
  }, [sections, lineItems, pricingTiers]);

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
      if (!firstSection?.boatId) {
        setActionState({ success: false, error: "Please select a boat for the first booking." });
        return;
      }
      if (firstSection.usePricingTier && !firstSection.pricingTierId) {
        setActionState({ success: false, error: "Please select a pricing tier or switch to custom pricing." });
        return;
      }
      if (!firstSection.usePricingTier && (firstSection.basePrice <= 0 || !sharedEnd)) {
        setActionState({ success: false, error: "Custom pricing requires base price and end date & time." });
        return;
      }
      if (!sharedStart) {
        setActionState({ success: false, error: "Please select start date and time." });
        return;
      }
      const invalidSection = sections.find(
        (s, i) =>
          i > 0 &&
          !s.sameUserAsAbove &&
          (!s.customerName?.trim() || !s.customerEmail?.trim()) &&
          !s.userId
      );
      if (invalidSection) {
        setActionState({ success: false, error: "Each booking needs customer details or 'Use same customer' checked." });
        return;
      }
      const invalidDates = sections.find((s, i) => {
        if (i === 0) return false;
        if (s.sameAsFirstBooking) return false;
        if (!s.startDateTime) return true;
        if (!s.usePricingTier && !s.endDateTime) return true;
        return false;
      });
      if (invalidDates) {
        setActionState({ success: false, error: "Each booking needs start & end dates, or 'Use same dates & times' checked." });
        return;
      }

      const formData = new FormData();
      formData.set("bookings", JSON.stringify(resolvePayload()));
      formData.set("lineItems", JSON.stringify(lineItems));
      formData.set("numberOfPassengers", String(numberOfPassengers));
      formData.set("pickupLocation", pickupLocation);
      formData.set("dropoffLocation", dropoffLocation);
      formData.set("specialRequests", specialRequests);
      formData.set("adminNotes", adminNotes);
      formData.set("groupName", groupName);
      formData.set("allowPayment", allowPayment ? "on" : "");
      formData.set("paymentType", paymentType);
      formData.set("expiresAt", expiresAt);

      startTransition(async () => {
        const result = await createBookingsAction(INITIAL_STATE, formData);
        setActionState(result);
        if (result.success) {
          setSections([createEmptyGroupSection()]);
          setCustomerName("");
          setCustomerEmail("");
          setCustomerPhone("");
          setSelectedUserId("");
          setGroupName("");
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
      firstSection,
      sharedStart,
      sharedEnd,
      sections,
      resolvePayload,
      lineItems,
      numberOfPassengers,
      pickupLocation,
      dropoffLocation,
      specialRequests,
      adminNotes,
      groupName,
      allowPayment,
      paymentType,
      expiresAt,
    ]
  );

  const addSection = () => {
    const first = sections[0];
    setSections((prev) => [
      ...prev,
      {
        ...createEmptyGroupSection(),
        usePricingTier: first?.usePricingTier ?? true,
        sameUserAsAbove: true,
        sameAsFirstBooking: true,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        userId: selectedUserId,
        startDateTime: sharedStart,
        endDateTime: sharedEnd,
      },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, updates: Partial<GroupSectionData>) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const setSharedStart = (v: string) => updateSection(0, { startDateTime: v });
  const setSharedEnd = (v: string) => updateSection(0, { endDateTime: v });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {actionState.success && (
        <Card className="rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-emerald-800">Booking group created successfully.</p>
            <p className="mt-1 text-xs text-emerald-700">
              A proposal has been sent to the customer&apos;s email and phone.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Group name (optional)</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Smith Family Trip"
                />
              </div>
            </CardContent>
          </Card>

          {sections.map((section, index) => (
            <Card key={index} className="rounded-2xl border border-border/60 bg-card shadow-sm">
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {index === 0 ? "Booking #1" : `Booking #${index + 1}`}
                  </h3>
                  {sections.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`same-customer-${index}`}
                      checked={section.sameUserAsAbove}
                      onCheckedChange={(c) => updateSection(index, { sameUserAsAbove: !!c })}
                    />
                    <Label htmlFor={`same-customer-${index}`} className="text-sm font-normal cursor-pointer">
                      Use same customer as first booking
                    </Label>
                  </div>
                )}

                {!(index > 0 && section.sameUserAsAbove) && (
                  <CustomerFields
                    customerType={index === 0 ? customerType : section.userId ? "existing_user" : "guest"}
                    onCustomerTypeChange={(v) =>
                      index === 0 ? setCustomerType(v) : v === "guest" && updateSection(index, { userId: "" })
                    }
                    selectedUserId={index === 0 ? selectedUserId : section.userId}
                    onSelectedUserIdChange={(v) =>
                      index === 0 ? setSelectedUserId(v) : updateSection(index, { userId: v })
                    }
                    customerName={index === 0 ? customerName : section.customerName}
                    onCustomerNameChange={(v) =>
                      index === 0 ? setCustomerName(v) : updateSection(index, { customerName: v })
                    }
                    customerEmail={index === 0 ? customerEmail : section.customerEmail}
                    onCustomerEmailChange={(v) =>
                      index === 0 ? setCustomerEmail(v) : updateSection(index, { customerEmail: v })
                    }
                    customerPhone={index === 0 ? customerPhone : section.customerPhone}
                    onCustomerPhoneChange={(v) =>
                      index === 0 ? setCustomerPhone(v) : updateSection(index, { customerPhone: v })
                    }
                    numberOfPassengers={numberOfPassengers}
                    onNumberOfPassengersChange={setNumberOfPassengers}
                  />
                )}

                <BookingSectionFields
                  section={section}
                  onChange={(u) => updateSection(index, u)}
                  pricingTiers={pricingTiers}
                  tiersByBoat={tiersByBoat}
                  showSameDatesOption={index > 0}
                  sameAsFirstBooking={section.sameAsFirstBooking}
                  onSameDatesChange={(c) => updateSection(index, { sameAsFirstBooking: c })}
                  useSharedDates={index > 0 && section.sameAsFirstBooking}
                  sharedStartDateTime={sharedStart}
                  sharedEndDateTime={sharedEnd}
                  onSharedStartChange={setSharedStart}
                  onSharedEndChange={setSharedEnd}
                  index={index}
                />
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addSection} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add another booking
          </Button>

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
              <AddOnsFields lineItems={lineItems} onChange={setLineItems} label="Add-ons (first booking)" />
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
          submitLabel="Create Booking Group"
          isPending={pending}
          error={actionState.error}
        />
      </div>
    </form>
  );
}
