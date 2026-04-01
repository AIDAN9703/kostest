"use client";

import { InlineOpsCell } from "./InlineOpsCell";
import { InlineOpsSelectCell } from "./InlineOpsSelectCell";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import {
  computeOpsBalanceClientCents,
  computeOpsBalanceOwnerCents,
  computeOpsRevenueCents,
} from "@/shared/lib/utils/ops-revenue";
export interface OpsRowContentProps {
  bookingId: string;
  totalAmountCents?: number | null;
  opsExpenseCents?: number | null;
  opsGmvCents?: number | null;
  opsPaidCents?: number | null;
  opsSentToOwnerCents?: number | null;
  opsCrewName?: string | null;
  opsNote?: string | null;
  opsContractSigned?: boolean | null;
  opsConnected?: boolean | null;
  opsClientPaid?: boolean | null;
  opsCaptainPaid?: boolean | null;
  opsAllPaid?: boolean | null;
  opsSheetsSent?: boolean | null;
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

function StatusFlagsBlock({
  bookingId,
  opsContractSigned,
  opsConnected,
  opsClientPaid,
  opsCaptainPaid,
  opsAllPaid,
  opsSheetsSent,
}: Pick<
  OpsRowContentProps,
  | "bookingId"
  | "opsContractSigned"
  | "opsConnected"
  | "opsClientPaid"
  | "opsCaptainPaid"
  | "opsAllPaid"
  | "opsSheetsSent"
>) {
  const specs = [
    {
      field: "contractSigned" as const,
      abbr: "Ctr",
      title: "Contract signed",
      v: opsContractSigned,
    },
    { field: "connected" as const, abbr: "Con", title: "Connected", v: opsConnected },
    { field: "clientPaid" as const, abbr: "Cli", title: "Client paid", v: opsClientPaid },
    { field: "captainPaid" as const, abbr: "Cap", title: "Captain paid", v: opsCaptainPaid },
    { field: "allPaid" as const, abbr: "All", title: "All paid", v: opsAllPaid },
    { field: "sheetsSent" as const, abbr: "Sh", title: "Sheets", v: opsSheetsSent },
  ];
  return (
    <div className="rounded-lg border border-border/60 p-3" role="group" aria-label="Status flags">
      <div className="grid grid-cols-3 gap-x-6 gap-y-4 sm:grid-cols-6 sm:gap-x-8">
        {specs.map(({ field, abbr, title, v }) => (
          <div key={field} className="flex flex-col items-center gap-1" title={title}>
            <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground">
              {abbr}
            </span>
            <InlineOpsCell bookingId={bookingId} field={field} value={v} isCheckbox />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OpsRowContent({
  bookingId,
  totalAmountCents,
  opsExpenseCents,
  opsGmvCents,
  opsPaidCents,
  opsSentToOwnerCents,
  opsCrewName,
  opsNote,
  opsContractSigned,
  opsConnected,
  opsClientPaid,
  opsCaptainPaid,
  opsAllPaid,
  opsSheetsSent,
  opsCommissionAgentCents,
  opsCommissionKosCents,
  opsSourceOverride,
}: OpsRowContentProps) {
  const revenueCentsDisplay = computeOpsRevenueCents(totalAmountCents, opsExpenseCents);
  const balanceClientDisplay = computeOpsBalanceClientCents(
    opsGmvCents,
    opsPaidCents,
    totalAmountCents
  );
  const balanceOwnerDisplay = computeOpsBalanceOwnerCents(
    opsExpenseCents,
    opsSentToOwnerCents
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-4">
        <OpsField label="Expense">
          <InlineOpsCell
            bookingId={bookingId}
            field="expenseCents"
            value={opsExpenseCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label="GMV">
          <InlineOpsCell
            bookingId={bookingId}
            field="gmvCents"
            value={opsGmvCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label="REV">
          <div className="min-h-8 px-2 py-1 text-sm tabular-nums text-foreground font-medium">
            {revenueCentsDisplay != null ? formatCentsAsCurrency(revenueCentsDisplay) : "—"}
          </div>
        </OpsField>
        <OpsField label="Source">
          <InlineOpsSelectCell
            bookingId={bookingId}
            variant="source"
            value={opsSourceOverride}
            applyCommissionOnSourceChange
            revenueCentsForCommission={revenueCentsDisplay}
          />
        </OpsField>
        <OpsField label="Comm A">
          <InlineOpsCell
            bookingId={bookingId}
            field="commissionAgentCents"
            value={opsCommissionAgentCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label="Comm KOS">
          <InlineOpsCell
            bookingId={bookingId}
            field="commissionKosCents"
            value={opsCommissionKosCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label="PAID">
          <InlineOpsCell
            bookingId={bookingId}
            field="paidCents"
            value={opsPaidCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label="Sent owner">
          <InlineOpsCell
            bookingId={bookingId}
            field="sentToOwnerCents"
            value={opsSentToOwnerCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label="Bal Owner">
          <div
            className="min-h-8 px-2 py-1 text-sm tabular-nums text-foreground"
            title="Expense − sent to owner (computed on save)"
          >
            {formatCentsAsCurrency(balanceOwnerDisplay)}
          </div>
        </OpsField>
        <OpsField label="Bal Client">
          <div
            className="min-h-8 px-2 py-1 text-sm tabular-nums text-foreground"
            title="Client amount still owed: ops GMV − PAID (uses charter quote total if ops GMV is empty)"
          >
            {formatCentsAsCurrency(balanceClientDisplay)}
          </div>
        </OpsField>
        <OpsField label="Crew">
          <InlineOpsCell
            bookingId={bookingId}
            field="crewName"
            value={opsCrewName}
            placeholder="—"
          />
        </OpsField>
        <OpsField label="Note">
          <InlineOpsCell bookingId={bookingId} field="opsNote" value={opsNote} placeholder="—" />
        </OpsField>
      </div>

      <div className="max-w-xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </p>
        <StatusFlagsBlock
          bookingId={bookingId}
          opsContractSigned={opsContractSigned}
          opsConnected={opsConnected}
          opsClientPaid={opsClientPaid}
          opsCaptainPaid={opsCaptainPaid}
          opsAllPaid={opsAllPaid}
          opsSheetsSent={opsSheetsSent}
        />
      </div>
    </div>
  );
}
