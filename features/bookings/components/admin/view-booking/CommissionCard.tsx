import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { BookingExpenseLine } from "@/features/bookings/booking-expense.types";
import type { DealEconomics } from "@/features/bookings/lib/booking-money";

/**
 * What KOS makes on this trip, read left to right: the charter's value, what
 * goes out (owner payout, fuel, crew, dockage), how the commission splits,
 * what's left. Its own card under Trip details + Crew — customer money stays
 * in Finances so the two never blur.
 */
export function CommissionCard({
  economics,
  expenseLines,
  commissionAgentCents,
  commissionKosCents,
  currency,
}: {
  economics: DealEconomics;
  /** Only for the line count — editing happens from Finances. */
  expenseLines: BookingExpenseLine[];
  commissionAgentCents: number | null;
  commissionKosCents: number | null;
  currency: string;
}) {
  const fmt = (c: number) => formatCentsAsCurrency(c, { currency });
  const agent = commissionAgentCents ?? 0;
  const kos = commissionKosCents ?? 0;
  const lineCount = expenseLines.length;

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Commission</CardTitle>
        <p className="text-xs text-muted-foreground">
          Charter value minus what we pay out is what KOS keeps.
        </p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
          <Stat
            label="Charter value"
            caption={economics.gmvOverridden ? "override" : undefined}
            value={economics.gmvCents != null ? fmt(economics.gmvCents) : "—"}
          />
          <Stat
            label="Expenses"
            caption={lineCount > 0 ? `${lineCount} ${lineCount === 1 ? "line" : "lines"}` : "none yet"}
            value={economics.expenseCents > 0 ? fmt(economics.expenseCents) : "—"}
            className={economics.expenseCents > 0 ? "text-muted-foreground" : undefined}
          />
          <Stat
            label="Commission split"
            caption={agent > 0 || kos > 0 ? "agent · KOS" : undefined}
            value={agent > 0 || kos > 0 ? `${fmt(agent)} · ${fmt(kos)}` : "—"}
          />
          <Stat
            label="KOS keeps"
            value={economics.revenueCents != null ? fmt(economics.revenueCents) : "—"}
            className={
              economics.revenueCents == null
                ? undefined
                : economics.revenueCents >= 0
                  ? "text-success"
                  : "text-destructive"
            }
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  caption,
  value,
  className,
}: {
  label: string;
  caption?: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-baseline gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
        {caption ? (
          <span className="normal-case tracking-normal text-muted-foreground/70">{caption}</span>
        ) : null}
      </dt>
      <dd className={cn("mt-1 truncate text-lg font-semibold tabular-nums", className)}>{value}</dd>
    </div>
  );
}
