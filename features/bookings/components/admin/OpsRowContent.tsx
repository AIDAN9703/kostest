"use client";

import { InlineOpsCell } from "./InlineOpsCell";

export interface OpsRowContentProps {
  bookingId: string;
  opsExpenseCents?: number | null;
  opsRevenueCents?: number | null;
  opsBalanceOwnerCents?: number | null;
  opsCrewName?: string | null;
  opsContractSigned?: boolean | null;
  opsCaptainPaid?: boolean | null;
  opsCommissionCents?: number | null;
  opsSourceOverride?: string | null;
}

function OpsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export function OpsRowContent({
  bookingId,
  opsExpenseCents,
  opsRevenueCents,
  opsBalanceOwnerCents,
  opsCrewName,
  opsContractSigned,
  opsCaptainPaid,
  opsCommissionCents,
  opsSourceOverride,
}: OpsRowContentProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 space-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      <OpsField label="Expense">
        <InlineOpsCell
          bookingId={bookingId}
          field="expenseCents"
          value={opsExpenseCents}
          isCents
          placeholder="—"
        />
      </OpsField>
      <OpsField label="REV">
        <InlineOpsCell
          bookingId={bookingId}
          field="revenueCents"
          value={opsRevenueCents}
          isCents
          placeholder="—"
        />
      </OpsField>
      <OpsField label="Bal Owner">
        <InlineOpsCell
          bookingId={bookingId}
          field="balanceOwnerCents"
          value={opsBalanceOwnerCents}
          isCents
          placeholder="—"
        />
      </OpsField>
      <OpsField label="Crew">
        <InlineOpsCell bookingId={bookingId} field="crewName" value={opsCrewName} placeholder="—" />
      </OpsField>
      <OpsField label="Commission">
        <InlineOpsCell
          bookingId={bookingId}
          field="commissionCents"
          value={opsCommissionCents}
          isCents
          placeholder="—"
        />
      </OpsField>
      <OpsField label="Source">
        <InlineOpsCell
          bookingId={bookingId}
          field="sourceOverride"
          value={opsSourceOverride}
          placeholder="—"
        />
      </OpsField>
      <OpsField label="Contract?">
        <InlineOpsCell
          bookingId={bookingId}
          field="contractSigned"
          value={opsContractSigned}
          isCheckbox
        />
      </OpsField>
      <OpsField label="C Paid?">
        <InlineOpsCell
          bookingId={bookingId}
          field="captainPaid"
          value={opsCaptainPaid}
          isCheckbox
        />
      </OpsField>
    </div>
  );
}
