"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, Send, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn, formatCurrency } from "@/shared/lib/utils/general-utils";
import { useThemeConfig } from "@/shared/admin/components/active-theme";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { useUser } from "@/features/users/hooks/useUsers";

import { CustomerFields } from "@/features/bookings/components/admin/booking-forms/shared/CustomerFields";
import { BookingSectionFields } from "@/features/bookings/components/admin/booking-forms/shared/BookingSectionFields";
import { AddOnsFields } from "@/features/bookings/components/admin/booking-forms/shared/AddOnsFields";
import {
  createEmptyBookingSection,
  type BookingSectionData,
  type PricingTierOption,
} from "@/features/bookings/components/admin/booking-forms/types";
import type { BookingAddOnInput } from "@/features/bookings/booking.types";
import type { BookingExpenseCategory } from "@/database/types";
import { createBookingFull } from "@/features/bookings/actions/create-booking-full.actions";

const STEPS = ["Client", "Charter", "Pricing"] as const;

const SOURCE_OPTIONS = ["Direct", "Broker", "Referral", "Website", "Boatsetter", "GetMyBoat"];

const OTHER_EXPENSE_CATEGORIES: { value: BookingExpenseCategory; label: string }[] = [
  { value: "CAPTAIN", label: "Captain" },
  { value: "FUEL", label: "Fuel" },
  { value: "DOCKAGE", label: "Dockage" },
  { value: "CREW", label: "Crew" },
  { value: "OTHER", label: "Other" },
];

type ExpenseRow = {
  key: string;
  category: BookingExpenseCategory;
  amount: string;
  label: string;
};

const dollarsToCents = (v: string) => Math.round((Number(v) || 0) * 100);

let rowSeq = 0;
const nextRowKey = () => `exp-${rowSeq++}`;

export function NewBookingModal({
  pricingTiers,
  triggerLabel = "Add booking",
  triggerClassName,
  defaultOpen = false,
  onCloseComplete,
}: {
  pricingTiers: PricingTierOption[];
  triggerLabel?: string;
  triggerClassName?: string;
  defaultOpen?: boolean;
  onCloseComplete?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const handleClose = () => {
    setOpen(false);
    onCloseComplete?.();
  };

  return (
    <>
      <Button
        size="sm"
        className={cn("h-9 gap-1.5", triggerClassName)}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        {triggerLabel}
      </Button>
      {open && (
        <NewBookingDialog
          pricingTiers={pricingTiers}
          onClose={handleClose}
        />
      )}
    </>
  );
}

function NewBookingDialog({
  pricingTiers,
  onClose,
}: {
  pricingTiers: PricingTierOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeTheme } = useThemeConfig();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(0); // 0..2, then success
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [proposalSent, setProposalSent] = useState(false);

  // Step 1 — client
  const [customerType, setCustomerType] = useState<"existing_user" | "guest">("existing_user");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfPassengers, setNumberOfPassengers] = useState(6);

  // Step 2 — charter
  const [section, setSection] = useState<BookingSectionData>(createEmptyBookingSection);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [lineItems, setLineItems] = useState<BookingAddOnInput[]>([]);

  // Step 3 — pricing / financials
  const [gmv, setGmv] = useState("");
  const [gmvTouched, setGmvTouched] = useState(false);
  const [ownerPayout, setOwnerPayout] = useState("");
  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([]);
  const [source, setSource] = useState("Direct");
  const [agentCode, setAgentCode] = useState("");

  // Send options
  const [allowPayment, setAllowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<"DEPOSIT_ONLY" | "FULL_PAYMENT">("FULL_PAYMENT");
  const [sendProposalEmail, setSendProposalEmail] = useState(false);
  const [sendProposalSms, setSendProposalSms] = useState(false);

  const { data: selectedUser } = useUser(selectedUserId || "");

  // Mirror SingleBookingForm: autofill from selected existing user
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
        (acc[tier.boatId] ??= []).push(tier);
        return acc;
      }, {}),
    [pricingTiers]
  );

  // Charter total (dollars) — base + cleaning + add-ons, matching SingleBookingForm preview
  const charterTotal = useMemo(() => {
    const tier = section.pricingTierId
      ? pricingTiers.find((t) => t.id === section.pricingTierId)
      : null;
    const basePrice = section.basePrice > 0 ? section.basePrice : (tier?.price ?? 0);
    const cleaningFee = section.boat?.cleaningFee ?? 0;
    const addOnsTotal = lineItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return basePrice + cleaningFee + addOnsTotal;
  }, [section, lineItems, pricingTiers]);

  // Prefill GMV with the charter total until the admin edits it
  useEffect(() => {
    if (!gmvTouched) setGmv(charterTotal > 0 ? String(charterTotal) : "");
  }, [charterTotal, gmvTouched]);

  const totalExpenses = useMemo(() => {
    const owner = Number(ownerPayout) || 0;
    const others = expenseRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return owner + others;
  }, [ownerPayout, expenseRows]);

  const effectiveGmv = gmv !== "" ? Number(gmv) || 0 : charterTotal;
  const kosRevenue = effectiveGmv - totalExpenses;

  // Per-step gating
  const step1Valid = customerName.trim() !== "" && /.+@.+\..+/.test(customerEmail);
  const step2Valid =
    !!section.boatId &&
    !!section.startDateTime &&
    (section.usePricingTier
      ? !!section.pricingTierId
      : section.basePrice > 0 && !!section.endDateTime);
  const canContinue = step === 0 ? step1Valid : step === 1 ? step2Valid : true;

  const handleSubmit = () => {
    const expenseLines = [
      ...((Number(ownerPayout) || 0) > 0
        ? [
            {
              category: "OWNER_PAYOUT" as BookingExpenseCategory,
              amountCents: dollarsToCents(ownerPayout),
              source: "MANUAL" as const,
            },
          ]
        : []),
      ...expenseRows
        .filter((r) => (Number(r.amount) || 0) > 0)
        .map((r) => ({
          category: r.category,
          amountCents: dollarsToCents(r.amount),
          label: r.label.trim() || null,
          source: "MANUAL" as const,
        })),
    ];

    const input = {
      booking: {
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
      numberOfPassengers,
      pickupLocation: pickupLocation || null,
      dropoffLocation: dropoffLocation || null,
      adminNotes: adminNotes || null,
      lineItems,
      gmvCents: gmv !== "" ? dollarsToCents(gmv) : null,
      source: source || null,
      agentCode: agentCode || null,
      expenseLines,
      allowPayment,
      paymentType,
      sendProposalEmail,
      sendProposalSms,
    };

    startTransition(async () => {
      const result = await createBookingFull(input);
      if (result.success && result.data) {
        setCreatedId(result.data.bookingId);
        setProposalSent(result.data.proposalSent);
        setStep(3); // success
        router.refresh();
      } else {
        toast({
          title: "Could not create booking",
          description: result.error ?? "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  };

  const isSuccess = step === 3;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "admin-theme",
          `theme-${activeTheme}`,
          "flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0"
        )}
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-xl">New Booking</DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Booking created."
              : `Replaces the QuickBooks invoice + sheet entry · Step ${step + 1} of 3`}
          </DialogDescription>
        </DialogHeader>

        {!isSuccess && (
          <div className="flex gap-1.5 px-6 py-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={cn(
                    "h-1 rounded-full",
                    i <= step ? "bg-primary" : "bg-muted"
                  )}
                />
                <span
                  className={cn(
                    "mt-1.5 block text-xs",
                    i <= step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto px-6 py-5">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Link an existing account or enter a guest. Existing users can see the booking
                in their dashboard.
              </p>
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
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Selecting a boat auto-fills its pricing tiers, deposit, and cleaning fee.
              </p>
              <BookingSectionFields
                section={section}
                onChange={(u) => setSection((s) => ({ ...s, ...u }))}
                pricingTiers={pricingTiers}
                tiersByBoat={tiersByBoat}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Pickup location</Label>
                  <Input
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Marina / dock"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dropoff location</Label>
                  <Input
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Internal notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Tip splits, special requests, captain notes… (staff only)"
                />
              </div>
              <AddOnsFields lineItems={lineItems} onChange={setLineItems} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Capture the gross value and what it costs you, so KOS revenue is tracked from
                day one.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gross (GMV) ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={gmv}
                    onChange={(e) => {
                      setGmvTouched(true);
                      setGmv(e.target.value);
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner payout ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ownerPayout}
                    onChange={(e) => setOwnerPayout(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Other expenses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Other expenses</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() =>
                      setExpenseRows((rows) => [
                        ...rows,
                        { key: nextRowKey(), category: "FUEL", amount: "", label: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5" /> Add expense
                  </Button>
                </div>
                {expenseRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Fuel, captain, dockage, crew… added to your cost and subtracted from KOS
                    revenue.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {expenseRows.map((row) => (
                      <div key={row.key} className="flex items-center gap-2">
                        <Select
                          value={row.category}
                          onValueChange={(v) =>
                            setExpenseRows((rows) =>
                              rows.map((r) =>
                                r.key === row.key
                                  ? { ...r, category: v as BookingExpenseCategory }
                                  : r
                              )
                            )
                          }
                        >
                          <SelectTrigger className="h-9 w-32 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OTHER_EXPENSE_CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="h-9 flex-1"
                          placeholder="Label (optional)"
                          value={row.label}
                          onChange={(e) =>
                            setExpenseRows((rows) =>
                              rows.map((r) =>
                                r.key === row.key ? { ...r, label: e.target.value } : r
                              )
                            )
                          }
                        />
                        <Input
                          className="h-9 w-28"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="$0"
                          value={row.amount}
                          onChange={(e) =>
                            setExpenseRows((rows) =>
                              rows.map((r) =>
                                r.key === row.key ? { ...r, amount: e.target.value } : r
                              )
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-muted-foreground"
                          onClick={() =>
                            setExpenseRows((rows) => rows.filter((r) => r.key !== row.key))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sales agent</Label>
                  <Input
                    value={agentCode}
                    onChange={(e) => setAgentCode(e.target.value)}
                    placeholder="Agent name or code"
                  />
                </div>
              </div>

              {/* Invoice summary */}
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  Invoice summary
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span>Charter gross (GMV)</span>
                    <span>{formatCurrency(effectiveGmv)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total expenses</span>
                    <span>({formatCurrency(totalExpenses)})</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span>KOS revenue</span>
                    <span className={kosRevenue >= 0 ? "text-emerald-600" : "text-destructive"}>
                      {formatCurrency(kosRevenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Send actions */}
              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 text-sm">
                  <Checkbox
                    checked={sendProposalEmail}
                    onCheckedChange={(c) => setSendProposalEmail(!!c)}
                    className="mt-0.5"
                  />
                  <span>Email a Stripe payment link / proposal to the customer</span>
                </label>
                <label className="flex items-start gap-2.5 text-sm">
                  <Checkbox
                    checked={sendProposalSms}
                    onCheckedChange={(c) => setSendProposalSms(!!c)}
                    className="mt-0.5"
                  />
                  <span>Text the proposal link (SMS)</span>
                </label>
                {(sendProposalEmail || sendProposalSms) && (
                  <div className="flex items-center gap-2.5 pl-7">
                    <Checkbox
                      id="allow-payment"
                      checked={allowPayment}
                      onCheckedChange={(c) => setAllowPayment(!!c)}
                    />
                    <Label htmlFor="allow-payment" className="font-normal">
                      Allow payment now
                    </Label>
                    {allowPayment && (
                      <Select
                        value={paymentType}
                        onValueChange={(v) =>
                          setPaymentType(v as "DEPOSIT_ONLY" | "FULL_PAYMENT")
                        }
                      >
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL_PAYMENT">Full payment</SelectItem>
                          <SelectItem value="DEPOSIT_ONLY">Deposit only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
                {/* Not built yet */}
                {["Send bareboat charter contract for e-signature", "Add to Google Calendar & notify captain", "Sync to QuickBooks"].map(
                  (txt) => (
                    <label
                      key={txt}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground/70"
                    >
                      <Checkbox disabled className="mt-0.5" />
                      <span className="flex items-center gap-2">
                        {txt}
                        <Badge variant="secondary" className="text-[10px]">
                          Coming soon
                        </Badge>
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold">Booking created</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {proposalSent
                  ? `${customerName || "The customer"} has been sent the proposal link.`
                  : "Saved as a draft. You can send the proposal from the booking page."}
              </p>
              <div className="mt-4 w-full max-w-xs rounded-lg border border-border bg-muted/40 p-4 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Charter gross</span>
                  <span>{formatCurrency(effectiveGmv)}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">KOS revenue</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(kosRevenue)}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                {createdId && (
                  <Button asChild>
                    <Link href={`/admin/bookings/${createdId}`}>View booking</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isSuccess && (
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={pending} className="gap-2">
                  <Send className="h-4 w-4" />
                  {pending ? "Creating…" : sendProposalEmail || sendProposalSms ? "Create & send" : "Create booking"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
