"use client";

import { InlineOpsCell } from "./InlineOpsCell";
import { InlineOpsSelectCell } from "./InlineOpsSelectCell";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import {
  computeOpsBalanceClientCents,
  computeOpsBalanceOwnerCents,
  computeOpsRevenueCents,
} from "@/shared/lib/utils/ops-revenue";
import { cn } from "@/shared/lib/utils/general-utils";

export interface OpsRowContentProps {
  bookingId: string;
  /**
   * `compact` = dense labels (bookings table expand row).
   * `comfortable` = booking detail page: plain layout, full words, no per-field boxes.
   */
  density?: "compact" | "comfortable";
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

function OpsField({
  label,
  children,
  density,
}: {
  label: string;
  children: React.ReactNode;
  density: "compact" | "comfortable";
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt
        className={cn(
          "text-muted-foreground",
          density === "compact"
            ? "text-xs font-medium uppercase tracking-wider"
            : "text-sm font-medium"
        )}
      >
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/** Mirrors {@link InlineOpsCell} padding/height so read-only values line up with editable cells */
function OpsReadonlyValue({
  children,
  density,
  title,
}: {
  children: React.ReactNode;
  density: "compact" | "comfortable";
  title?: string;
}) {
  return (
    <div
      title={title}
      className={cn(
        "flex tabular-nums text-foreground",
        density === "comfortable"
          ? "min-h-8 items-center px-2 py-1 -mx-2 -my-1 text-sm font-medium"
          : "min-h-7 items-center px-1.5 py-0.5 -mx-0.5 text-xs font-medium"
      )}
    >
      {children}
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
  density,
}: Pick<
  OpsRowContentProps,
  | "bookingId"
  | "opsContractSigned"
  | "opsConnected"
  | "opsClientPaid"
  | "opsCaptainPaid"
  | "opsAllPaid"
  | "opsSheetsSent"
  | "density"
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
    { field: "sheetsSent" as const, abbr: "Sh", title: "Sheets sent", v: opsSheetsSent },
  ];
  return (
    <div className="rounded-lg border border-border/60 p-3" role="group" aria-label="Status flags">
      <div
        className={cn(
          "grid gap-x-6 gap-y-4",
          density === "comfortable"
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            : "grid-cols-3 sm:grid-cols-6 sm:gap-x-8"
        )}
      >
        {specs.map(({ field, abbr, title, v }) => (
          <div key={field} className="flex flex-col items-center gap-1.5 text-center" title={title}>
            {density === "comfortable" ? (
              <span className="text-xs font-medium leading-snug text-foreground">{title}</span>
            ) : (
              <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground">
                {abbr}
              </span>
            )}
            <InlineOpsCell bookingId={bookingId} field={field} value={v} isCheckbox />
          </div>
        ))}
      </div>
    </div>
  );
}

const LABELS = {
  compact: {
    expense: "Expense",
    gmv: "GMV",
    rev: "REV",
    source: "Source",
    commA: "Comm A",
    commKos: "Comm KOS",
    paid: "PAID",
    sentOwner: "Sent owner",
    balOwner: "Bal Owner",
    balClient: "Bal Client",
    crew: "Crew",
    note: "Note",
  },
  comfortable: {
    expense: "Expense",
    gmv: "GMV",
    rev: "Revenue",
    source: "Source",
    commA: "Commission (agent)",
    commKos: "Commission (KOS)",
    paid: "Paid",
    sentOwner: "Sent to owner",
    balOwner: "Balance (owner)",
    balClient: "Balance (client)",
    crew: "Crew",
    note: "Note",
  },
} as const;

export function OpsRowContent({
  bookingId,
  density = "compact",
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
  const L = LABELS[density];
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
      <div
        className={cn(
          "flex flex-wrap items-start",
          density === "comfortable"
            ? "gap-x-8 gap-y-5"
            : "gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4"
        )}
      >
        <OpsField label={L.expense} density={density}>
          <InlineOpsCell
            bookingId={bookingId}
            field="expenseCents"
            value={opsExpenseCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label={L.gmv} density={density}>
          <InlineOpsCell
            bookingId={bookingId}
            field="gmvCents"
            value={opsGmvCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label={L.rev} density={density}>
          <OpsReadonlyValue density={density}>
            {revenueCentsDisplay != null ? formatCentsAsCurrency(revenueCentsDisplay) : "—"}
          </OpsReadonlyValue>
        </OpsField>
        <OpsField label={L.source} density={density}>
          <InlineOpsSelectCell
            bookingId={bookingId}
            variant="source"
            value={opsSourceOverride}
            applyCommissionOnSourceChange
            revenueCentsForCommission={revenueCentsDisplay}
          />
        </OpsField>
        <OpsField label={L.commA} density={density}>
          <InlineOpsCell
            bookingId={bookingId}
            field="commissionAgentCents"
            value={opsCommissionAgentCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label={L.commKos} density={density}>
          <InlineOpsCell
            bookingId={bookingId}
            field="commissionKosCents"
            value={opsCommissionKosCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label={L.paid} density={density}>
          <InlineOpsCell
            bookingId={bookingId}
            field="paidCents"
            value={opsPaidCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label={L.sentOwner} density={density}>
          <InlineOpsCell
            bookingId={bookingId}
            field="sentToOwnerCents"
            value={opsSentToOwnerCents}
            isCents
            placeholder="—"
          />
        </OpsField>
        <OpsField label={L.balOwner} density={density}>
          <OpsReadonlyValue
            density={density}
            title="Expense − sent to owner (computed on save)"
          >
            {formatCentsAsCurrency(balanceOwnerDisplay)}
          </OpsReadonlyValue>
        </OpsField>
        <OpsField label={L.balClient} density={density}>
          <OpsReadonlyValue
            density={density}
            title="Client amount still owed: ops GMV − PAID (uses charter quote total if ops GMV is empty)"
          >
            {formatCentsAsCurrency(balanceClientDisplay)}
          </OpsReadonlyValue>
        </OpsField>
        <OpsField label={L.crew} density={density}>
          <InlineOpsCell
            bookingId={bookingId}
            field="crewName"
            value={opsCrewName}
            placeholder="—"
          />
        </OpsField>
        <OpsField label={L.note} density={density}>
          <InlineOpsCell bookingId={bookingId} field="opsNote" value={opsNote} placeholder="—" />
        </OpsField>
      </div>

      <div className={cn(density === "comfortable" ? "w-full" : "w-full md:max-w-4xl")}>
        <p
          className={cn(
            "mb-2 text-muted-foreground",
            density === "comfortable"
              ? "text-sm font-medium"
              : "text-xs font-medium uppercase tracking-wider"
          )}
        >
          {density === "comfortable" ? "Status flags" : "Status"}
        </p>
        <StatusFlagsBlock
          bookingId={bookingId}
          density={density}
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
