import { SectionCard } from "@/shared/components/SectionCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { CharterSourceBreakdownRow } from "../dashboard";

export function RevenueBySourceSection({
  rows,
  monthLabel,
}: {
  rows: CharterSourceBreakdownRow[];
  monthLabel: string;
}) {
  const maxGmv = Math.max(...rows.map((r) => r.gmvCents), 1);

  return (
    <SectionCard
      title="Charter value by source"
      subtitle={`Trips starting in ${monthLabel} — override from ops, else booking source`}
    >
      <div className="flex-1 p-6">
        {rows.length === 0 ? (
          <EmptyState
            emoji="🧭"
            title="No trips this month"
            description="When charters start in the current month, they will roll up here."
          />
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const pct = Math.round((row.gmvCents / maxGmv) * 100);
              return (
                <div key={row.sourceKey}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-foreground">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCentsAsCurrency(row.gmvCents)}
                      <span className="ml-2 text-[0.7rem]">
                        ({row.bookingCount} trip{row.bookingCount === 1 ? "" : "s"})
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
