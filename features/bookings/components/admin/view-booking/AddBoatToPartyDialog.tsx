"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";
import { BoatSelect } from "@/features/boats/components/BoatSelect";
import { boatsApi } from "@/features/boats/boat.api";
import { addBoatToCharterParty } from "@/features/bookings/actions/admin-booking.actions";

interface TierOption {
  id: string;
  hours: number;
  price: number;
  name: string | null;
  isActive: boolean;
  isDefault: boolean;
}

/**
 * "Add another boat" — grows a booking into a charter party (or grows the
 * party). Pick a boat, pick its pricing option; the new boat copies the
 * trip window and customer, joins as Proposed under the same proposal link.
 */
export function AddBoatToPartyDialog({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [boatId, setBoatId] = useState("");
  const [tiers, setTiers] = useState<TierOption[]>([]);
  const [tierId, setTierId] = useState("");
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!boatId) {
      setTiers([]);
      setTierId("");
      return;
    }
    let cancelled = false;
    setLoadingTiers(true);
    boatsApi
      .getBoatPricingTiers(boatId)
      .then((rows: TierOption[]) => {
        if (cancelled) return;
        const active = rows.filter((t) => t.isActive);
        setTiers(active);
        setTierId(active.find((t) => t.isDefault)?.id ?? active[0]?.id ?? "");
      })
      .catch(() => {
        if (!cancelled) setTiers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTiers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boatId]);

  async function handleAdd() {
    if (!boatId || !tierId) return;
    setSaving(true);
    try {
      const result = await addBoatToCharterParty(bookingId, { boatId, pricingTierId: tierId });
      if (result.success) {
        toast({
          title: "Boat added",
          description: "It joined the party — resend the proposal so the customer sees it.",
        });
        onOpenChange(false);
        setBoatId("");
        router.refresh();
      } else {
        toast({ title: "Couldn't add the boat", description: result.error, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-theme rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add another boat</DialogTitle>
          <DialogDescription>
            Same trip, same customer — the new boat joins this charter party as a proposal under the
            same proposal link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Boat</Label>
            <BoatSelect
              value={boatId}
              onChange={(id) => setBoatId(id)}
              showClearButton={false}
              placeholder="Pick a boat"
            />
          </div>

          {boatId ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Pricing option</Label>
              {loadingTiers ? (
                <p className="py-2 text-sm text-muted-foreground">Loading options…</p>
              ) : tiers.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">
                  This boat has no active pricing options.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {tiers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTierId(t.id)}
                      className={cn(
                        "flex items-baseline justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        tierId === t.id
                          ? "bg-primary-soft text-primary-strong ring-1 ring-primary/50"
                          : "bg-secondary/40 hover:bg-secondary/70"
                      )}
                    >
                      <span className="font-medium">
                        {t.name || `${t.hours} hours`}
                      </span>
                      <span className="tabular-nums">${t.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="gap-1.5 rounded-full px-5"
            onClick={handleAdd}
            disabled={saving || !boatId || !tierId}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add boat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
