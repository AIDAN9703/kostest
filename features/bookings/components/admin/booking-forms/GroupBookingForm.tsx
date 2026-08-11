"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createBookingsAction } from "@/features/bookings/actions/create-bookings.actions";
import type { ActionResponse } from "@/shared/lib/types/types";
import { useUser } from "@/features/users/hooks/useUsers";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { ToastAction } from "@/shared/components/ui/toast";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { CustomerFields } from "./shared/CustomerFields";
import { AddOnsFields } from "./shared/AddOnsFields";
import { BookingSectionFields } from "./shared/BookingSectionFields";
import { DraftOptionsSidebar } from "./shared/DraftOptionsSidebar";
import { buildSectionPreview, groupTiersByBoat } from "./shared/pricing";
import { createEmptyGroupSection, type GroupSectionData, type PricingTierOption } from "./types";
import type { BookingAddOnInput } from "@/features/bookings/booking.types";

interface GroupBookingFormProps {
  pricingTiers: PricingTierOption[];
}

const INITIAL_STATE: ActionResponse<{
  bookingIds: string[];
  publicToken: string | null;
  groupId: string | null;
  proposalSent?: boolean;
}> = { success: false };

export function GroupBookingForm({ pricingTiers }: GroupBookingFormProps) {
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

  const [sections, setSections] = useState<GroupSectionData[]>(() => [createEmptyGroupSection()]);
  const [groupName, setGroupName] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [lineItems, setLineItems] = useState<BookingAddOnInput[]>([]);

  const [allowPayment, setAllowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<"DEPOSIT_ONLY" | "FULL_PAYMENT">("FULL_PAYMENT");
  const [sendProposalEmail, setSendProposalEmail] = useState(false);
  const [sendProposalSms, setSendProposalSms] = useState(false);

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

  const tiersByBoat = useMemo(() => groupTiersByBoat(pricingTiers), [pricingTiers]);

  const firstSection = sections[0];
  const sharedStart = firstSection?.startDateTime ?? "";
  const sharedEnd = firstSection?.endDateTime ?? "";

  const resolvePayload = useCallback(() => {
    return sections.map((section, index) => {
      const customer =
        index === 0 || section.sameUserAsAbove
          ? {
              customerName,
              customerEmail,
              customerPhone: customerPhone || null,
              userId: selectedUserId || null,
            }
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
        usePricingTier: section.usePricingTier,
        pricingTierId: section.usePricingTier ? section.pricingTierId || null : null,
        basePrice: section.basePrice,
        depositAmount: section.depositAmount ?? null,
        ...customer,
        ...dates,
      };
    });
  }, [
    sections,
    customerName,
    customerEmail,
    customerPhone,
    selectedUserId,
    sharedStart,
    sharedEnd,
  ]);

  const preview = useMemo(
    // Shared add-ons ride on the first section only.
    () =>
      sections.map((section, idx) =>
        buildSectionPreview(section, idx === 0 ? lineItems : [], pricingTiers)
      ),
    [sections, lineItems, pricingTiers]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const formData = new FormData();
      formData.set("bookings", JSON.stringify(resolvePayload()));
      formData.set("lineItems", JSON.stringify(lineItems));
      formData.set("numberOfPassengers", String(numberOfPassengers));
      formData.set("pickupLocation", pickupLocation);
      formData.set("dropoffLocation", dropoffLocation);
      formData.set("adminNotes", adminNotes);
      formData.set("groupName", groupName);
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
            ? "A proposal has been sent to the customer's email and phone."
            : "Booking group saved as draft.";
          toast({
            title: "Booking group created successfully.",
            description: successDesc,
            variant: "success",
            action: bookingId ? (
              <ToastAction asChild altText="View booking">
                <Link href={`/admin/bookings/${bookingId}`}>View booking</Link>
              </ToastAction>
            ) : undefined,
          });
          setSections([createEmptyGroupSection()]);
          setCustomerName("");
          setCustomerEmail("");
          setCustomerPhone("");
          setSelectedUserId("");
          setGroupName("");
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
      resolvePayload,
      lineItems,
      numberOfPassengers,
      pickupLocation,
      dropoffLocation,
      adminNotes,
      groupName,
      allowPayment,
      paymentType,
      sendProposalEmail,
      sendProposalSms,
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
        userId: selectedUserId || null,
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
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const setSharedStart = (v: string) => updateSection(0, { startDateTime: v });
  const setSharedEnd = (v: string) => updateSection(0, { endDateTime: v });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
                    <Label
                      htmlFor={`same-customer-${index}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Use same customer as first booking
                    </Label>
                  </div>
                )}

                {!(index > 0 && section.sameUserAsAbove) && (
                  <CustomerFields
                    customerType={
                      index === 0 ? customerType : section.userId ? "existing_user" : "guest"
                    }
                    onCustomerTypeChange={(v) =>
                      index === 0
                        ? setCustomerType(v)
                        : v === "guest" && updateSection(index, { userId: null })
                    }
                    selectedUserId={index === 0 ? selectedUserId : section.userId ?? ""}
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
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Visible to staff only"
                  rows={2}
                />
              </div>
              <AddOnsFields lineItems={lineItems} onChange={setLineItems} variant="group" />
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
          submitLabel="Create Booking Group"
          isPending={pending}
          error={actionState.error}
        />
      </div>
    </form>
  );
}
