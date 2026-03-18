"use client";

import { InlineOpsCell } from "./InlineOpsCell";

export interface OpsRowContentProps {
  bookingId: string;
  opsExpenseCents?: number | null;
  opsGmvCents?: number | null;
  opsRevenueCents?: number | null;
  opsPaidCents?: number | null;
  opsBalanceOwnerCents?: number | null;
  opsBalanceClientCents?: number | null;
  opsCrewName?: string | null;
  opsNote?: string | null;
  opsContractSigned?: boolean | null;
  opsConnected?: boolean | null;
  opsClientPaid?: boolean | null;
  opsCaptainPaid?: boolean | null;
  opsAllPaid?: boolean | null;
  opsSheetsSent?: boolean | null;
  opsAgentCode?: string | null;
  opsCommissionAgentCents?: number | null;
  opsCommissionKosCents?: number | null;
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
  opsGmvCents,
  opsRevenueCents,
  opsPaidCents,
  opsBalanceOwnerCents,
  opsBalanceClientCents,
  opsCrewName,
  opsNote,
  opsContractSigned,
  opsConnected,
  opsClientPaid,
  opsCaptainPaid,
  opsAllPaid,
  opsSheetsSent,
  opsAgentCode,
  opsCommissionAgentCents,
  opsCommissionKosCents,
  opsCommissionCents,
  opsSourceOverride,
}: OpsRowContentProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 space-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <OpsField label="Expense">
        <InlineOpsCell bookingId={bookingId} field="expenseCents" value={opsExpenseCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="GMV">
        <InlineOpsCell bookingId={bookingId} field="gmvCents" value={opsGmvCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="REV">
        <InlineOpsCell bookingId={bookingId} field="revenueCents" value={opsRevenueCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="PAID">
        <InlineOpsCell bookingId={bookingId} field="paidCents" value={opsPaidCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="Bal Owner">
        <InlineOpsCell bookingId={bookingId} field="balanceOwnerCents" value={opsBalanceOwnerCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="Bal Client">
        <InlineOpsCell bookingId={bookingId} field="balanceClientCents" value={opsBalanceClientCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="Crew">
        <InlineOpsCell bookingId={bookingId} field="crewName" value={opsCrewName} placeholder="—" />
      </OpsField>
      <OpsField label="Note">
        <InlineOpsCell bookingId={bookingId} field="opsNote" value={opsNote} placeholder="—" />
      </OpsField>
      <OpsField label="Contract?">
        <InlineOpsCell bookingId={bookingId} field="contractSigned" value={opsContractSigned} isCheckbox />
      </OpsField>
      <OpsField label="Connected?">
        <InlineOpsCell bookingId={bookingId} field="connected" value={opsConnected} isCheckbox />
      </OpsField>
      <OpsField label="C Paid?">
        <InlineOpsCell bookingId={bookingId} field="clientPaid" value={opsClientPaid} isCheckbox />
      </OpsField>
      <OpsField label="Capt Paid?">
        <InlineOpsCell bookingId={bookingId} field="captainPaid" value={opsCaptainPaid} isCheckbox />
      </OpsField>
      <OpsField label="All Paid?">
        <InlineOpsCell bookingId={bookingId} field="allPaid" value={opsAllPaid} isCheckbox />
      </OpsField>
      <OpsField label="Sheets?">
        <InlineOpsCell bookingId={bookingId} field="sheetsSent" value={opsSheetsSent} isCheckbox />
      </OpsField>
      <OpsField label="Agent">
        <InlineOpsCell bookingId={bookingId} field="agentCode" value={opsAgentCode} placeholder="—" />
      </OpsField>
      <OpsField label="Comm Agent">
        <InlineOpsCell bookingId={bookingId} field="commissionAgentCents" value={opsCommissionAgentCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="Comm KOS">
        <InlineOpsCell bookingId={bookingId} field="commissionKosCents" value={opsCommissionKosCents} isCents placeholder="—" />
      </OpsField>
      <OpsField label="Source">
        <InlineOpsCell bookingId={bookingId} field="sourceOverride" value={opsSourceOverride} placeholder="—" />
      </OpsField>
    </div>
  );
}
