"use client";

/**
 * BookingCreateWizard — 3-step prototype modal for testing a faster booking
 * creation UX. Inspired by the /test route mockup. NOT wired to the real
 * `createBooking` server action yet — on submit it logs the payload and shows
 * a toast confirmation. The existing /admin/bookings/create flow remains the
 * production path until we decide to graduate this.
 *
 * Steps:
 *   1. Client   — name, phone, email + send-welcome checkbox
 *   2. Charter  — boat, date, start time, duration, captain, internal notes
 *   3. Pricing  — GMV, owner expense, source, agent, side-effect checkboxes
 */

import { useMemo, useState } from "react";
import {
  Anchor,
  CheckCircle2,
  Compass,
  DollarSign,
  Mail,
  Phone,
  Send,
  User,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

type Step = 1 | 2 | 3;

const SOURCE_OPTIONS = ["Direct", "Broker", "Referral", "Boatsetter", "GetMyBoat"] as const;

interface BoatOption {
  id: string;
  name: string;
  capacity: number;
  cleaningFee?: number | null;
  depositAmount?: number | null;
}

interface CaptainOption {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface AdminOption {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface WizardFormData {
  // Client
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sendWelcomeEmail: boolean;

  // Charter
  boatId: string;
  date: string;
  startTime: string;
  durationHours: string;
  captainId: string;
  notes: string;

  // Pricing
  gmv: string;
  expense: string;
  source: (typeof SOURCE_OPTIONS)[number];
  agentId: string;
  sendInvoice: boolean;
  sendContract: boolean;
  addToCalendar: boolean;
  syncToQuickbooks: boolean;
}

const INITIAL_DATA: WizardFormData = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  sendWelcomeEmail: true,
  boatId: "",
  date: "",
  startTime: "",
  durationHours: "",
  captainId: "",
  notes: "",
  gmv: "",
  expense: "",
  source: "Direct",
  agentId: "",
  sendInvoice: true,
  sendContract: true,
  addToCalendar: true,
  syncToQuickbooks: false,
};

interface BookingCreateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boats: BoatOption[];
  captains: CaptainOption[];
  admins: AdminOption[];
}

function formatName(p: { firstName: string | null; lastName: string | null; email: string }): string {
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return name || p.email;
}

function currency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function BookingCreateWizard({
  open,
  onOpenChange,
  boats,
  captains,
  admins,
}: BookingCreateWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<WizardFormData>(INITIAL_DATA);

  const set = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setStep(1);
    setData(INITIAL_DATA);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const canAdvance = useMemo(() => {
    if (step === 1) {
      return (
        data.clientName.trim().length > 0 &&
        data.clientEmail.trim().length > 0 &&
        data.clientPhone.trim().length > 0
      );
    }
    if (step === 2) {
      return (
        data.boatId !== "" &&
        data.date !== "" &&
        data.startTime !== "" &&
        data.durationHours !== ""
      );
    }
    return true;
  }, [step, data]);

  const gmvNumber = Number(data.gmv) || 0;
  const expenseNumber = Number(data.expense) || 0;
  const revenue = gmvNumber - expenseNumber;

  const handleSubmit = () => {
    const payload = {
      ...data,
      derived: { gmvNumber, expenseNumber, revenue },
    };
    // Prototype only: log the payload and confirm via toast. The real create
    // action will be wired up after we agree on the final shape.
    console.info("[booking wizard] would create booking with:", payload);
    toast({
      title: "Booking captured (prototype)",
      description: `Would create a $${gmvNumber.toLocaleString()} booking for ${data.clientName || "Unknown"}. Payload logged to console.`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-border bg-card p-6">
          <div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              New booking
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Prototype wizard · Step {step} of 3 · Currently does not save — payload logs to console.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => handleOpenChange(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <ProgressBar step={step} />

        <div className="flex max-h-[60vh] flex-col overflow-y-auto px-6 py-5">
          {step === 1 && (
            <StepClient
              data={data}
              set={set}
            />
          )}
          {step === 2 && (
            <StepCharter
              data={data}
              set={set}
              boats={boats}
              captains={captains}
            />
          )}
          {step === 3 && (
            <StepPricing
              data={data}
              set={set}
              admins={admins}
              gmvNumber={gmvNumber}
              expenseNumber={expenseNumber}
              revenue={revenue}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)))}
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)))}
                disabled={!canAdvance}
              >
                Continue
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} className="gap-2">
                <Send className="h-3.5 w-3.5" />
                Create & send
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1 border-b border-border bg-card px-6 py-3">
      {([1, 2, 3] as Step[]).map((s) => (
        <div
          key={s}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            s <= step ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-base font-semibold leading-tight text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}

function StepClient({
  data,
  set,
}: {
  data: WizardFormData;
  set: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={User}
        title="Client"
        subtitle="Create a new client or paste their details. We can wire the existing-client search in later."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Full name">
          <Input
            value={data.clientName}
            onChange={(e) => set("clientName", e.target.value)}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Phone">
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={data.clientPhone}
              onChange={(e) => set("clientPhone", e.target.value)}
              placeholder="(305) 555-0123"
            />
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                type="email"
                value={data.clientEmail}
                onChange={(e) => set("clientEmail", e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
          </Field>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={data.sendWelcomeEmail}
          onChange={(e) => set("sendWelcomeEmail", e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary"
        />
        <span className="text-muted-foreground">
          Send welcome email and create an account on kosyachts.com so they can view this booking.
        </span>
      </label>
    </div>
  );
}

function StepCharter({
  data,
  set,
  boats,
  captains,
}: {
  data: WizardFormData;
  set: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
  boats: BoatOption[];
  captains: CaptainOption[];
}) {
  return (
    <div>
      <StepHeader
        icon={Compass}
        title="Charter details"
        subtitle="Boat selection auto-populates the owner and default expense (prototype: edit later if needed)."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Boat">
            <Select value={data.boatId} onValueChange={(v) => set("boatId", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a boat..." />
              </SelectTrigger>
              <SelectContent>
                {boats.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No boats available
                  </SelectItem>
                ) : (
                  boats.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                      {b.capacity ? ` · ${b.capacity} guests` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Date">
          <Input
            type="date"
            value={data.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="Start time">
          <Input
            type="time"
            value={data.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </Field>
        <Field label="Duration (hours)">
          <Input
            type="number"
            min={1}
            step={1}
            value={data.durationHours}
            onChange={(e) => set("durationHours", e.target.value)}
            placeholder="4"
          />
        </Field>
        <Field label="Captain">
          <Select value={data.captainId} onValueChange={(v) => set("captainId", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Auto-assign or pick" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">
                <span className="flex items-center gap-2">
                  <Anchor className="h-3 w-3 text-muted-foreground" />
                  Auto-assign
                </span>
              </SelectItem>
              {captains.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {formatName(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Internal notes">
            <Textarea
              rows={3}
              value={data.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Tip splits, special requests, captain notes..."
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function StepPricing({
  data,
  set,
  admins,
  gmvNumber,
  expenseNumber,
  revenue,
}: {
  data: WizardFormData;
  set: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
  admins: AdminOption[];
  gmvNumber: number;
  expenseNumber: number;
  revenue: number;
}) {
  const isNegative = revenue < 0;
  return (
    <div>
      <StepHeader
        icon={DollarSign}
        title="Pricing & invoice"
        subtitle="In production, this will generate the Stripe payment link, contract, and side-effects in one step."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Gross (GMV)">
          <CurrencyInput
            value={data.gmv}
            onChange={(v) => set("gmv", v)}
            placeholder="2500"
          />
        </Field>
        <Field label="Owner expense">
          <CurrencyInput
            value={data.expense}
            onChange={(v) => set("expense", v)}
            placeholder="1800"
          />
        </Field>
        <Field label="Source">
          <Select
            value={data.source}
            onValueChange={(v) => set("source", v as (typeof SOURCE_OPTIONS)[number])}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sales agent">
          <Select value={data.agentId} onValueChange={(v) => set("agentId", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Pick an admin" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {formatName(a)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Invoice summary
        </div>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground">Charter total</span>
            <span className="tabular-nums text-foreground">{currency(gmvNumber)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Owner payout</span>
            <span className="tabular-nums">({currency(expenseNumber)})</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span className="text-foreground">KOS revenue</span>
            <span
              className={cn(
                "tabular-nums",
                isNegative
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {currency(revenue)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <CheckboxRow
          label="Email invoice via Stripe payment link"
          checked={data.sendInvoice}
          onChange={(v) => set("sendInvoice", v)}
        />
        <CheckboxRow
          label="Send bareboat charter contract for e-signature"
          checked={data.sendContract}
          onChange={(v) => set("sendContract", v)}
        />
        <CheckboxRow
          label="Add to Google Calendar and notify captain"
          checked={data.addToCalendar}
          onChange={(v) => set("addToCalendar", v)}
        />
        <CheckboxRow
          label="Sync to QuickBooks for accountant"
          checked={data.syncToQuickbooks}
          onChange={(v) => set("syncToQuickbooks", v)}
        />
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
        Prototype: clicking <span className="font-medium text-foreground">Create & send</span> will log the payload to the console; it does not save to the database yet.
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="block">
        <FieldLabel>{label}</FieldLabel>
      </Label>
      {children}
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        className="pl-7"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}
