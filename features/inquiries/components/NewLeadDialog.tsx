"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  createManualLead,
  type ManualLeadInput,
} from "@/features/inquiries/inquiry.actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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

const SOURCE_OPTIONS = [
  { value: "PHONE", label: "Phone call" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "BROKER", label: "Broker" },
  { value: "OTHER", label: "Other" },
] as const;

const TIME_OPTIONS = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "FLEXIBLE", label: "Flexible" },
] as const;

const EMPTY: ManualLeadInput = {
  name: "",
  email: "",
  phone: "",
  source: "PHONE",
  date: "",
  timeOfDay: undefined,
  guests: "",
  budget: "",
  message: "",
};

/**
 * Log a lead that arrived outside the website — phone, Instagram, WhatsApp,
 * broker. Auto-claimed by whoever logs it.
 */
export function NewLeadDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<ManualLeadInput>(EMPTY);

  function set<K extends keyof ManualLeadInput>(key: K, value: ManualLeadInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await createManualLead({
      ...form,
      email: form.email || "",
      timeOfDay: form.timeOfDay || undefined,
    });
    setPending(false);
    if (res.success) {
      toast({ title: "Lead logged ✓", description: "Claimed by you and in the pipeline." });
      setForm(EMPTY);
      setOpen(false);
      router.refresh();
    } else {
      toast({ title: "Couldn't log lead", description: res.error, variant: "destructive" });
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 rounded-none bg-foreground font-mono text-xs uppercase tracking-wider text-background hover:bg-foreground/85"
      >
        <Plus className="h-3.5 w-3.5" />
        New lead
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log a lead</DialogTitle>
            <DialogDescription>
              For inquiries that came in by phone, DM, or referral. It&apos;ll be
              claimed by you automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  className="mt-1.5 rounded-xl"
                  placeholder="John Smith"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => set("source", v as ManualLeadInput["source"])}
                >
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1.5 rounded-xl"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-1.5 rounded-xl"
                  type="email"
                  placeholder="optional"
                  value={form.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div>
                <Label>Preferred date</Label>
                <Input
                  className="mt-1.5 rounded-xl"
                  type="date"
                  value={form.date ?? ""}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div>
                <Label>Time of day</Label>
                <Select
                  value={form.timeOfDay ?? ""}
                  onValueChange={(v) => set("timeOfDay", v as ManualLeadInput["timeOfDay"])}
                >
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Guests</Label>
                <Input
                  className="mt-1.5 rounded-xl"
                  type="number"
                  min={1}
                  placeholder="4"
                  value={form.guests ?? ""}
                  onChange={(e) => set("guests", e.target.value)}
                />
              </div>
              <div>
                <Label>Budget</Label>
                <Input
                  className="mt-1.5 rounded-xl"
                  placeholder="e.g. 5000"
                  value={form.budget ?? ""}
                  onChange={(e) => set("budget", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1.5 min-h-[80px] resize-none rounded-xl"
                placeholder="What they're looking for, callback time, etc."
                value={form.message ?? ""}
                onChange={(e) => set("message", e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="rounded-xl">
                {pending ? "Saving…" : "Log lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
