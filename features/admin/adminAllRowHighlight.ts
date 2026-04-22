/**
 * Admin → All: row highlight keys and styling (persisted on booking / inquiry).
 * Meaning: see ADMIN_ALL_HIGHLIGHT_LEGEND (aligned with ops color key).
 */
export const ADMIN_ALL_HIGHLIGHT_IDS = [
  "inquiry",
  "depositIn",
  "paymentComplete",
  "reconcile",
  "cancel",
] as const;

export type AdminAllHighlightId = (typeof ADMIN_ALL_HIGHLIGHT_IDS)[number];

/** Stored values from the previous palette — still applied when reading from DB */
const LEGACY_HIGHLIGHT_MAP: Partial<Record<string, AdminAllHighlightId>> = {
  yellow: "depositIn",
  green: "paymentComplete",
  blue: "reconcile",
  red: "cancel",
};

/**
 * Include explicit hover + dark:hover so we override `TableRow`’s default
 * `hover:bg-muted/50` (otherwise colored rows would flash gray on hover).
 */
const HIGHLIGHT_ROW: Record<AdminAllHighlightId, string> = {
  inquiry:
    "bg-white dark:bg-zinc-950/90 hover:bg-zinc-50 dark:hover:bg-zinc-900/95",
  depositIn:
    "bg-amber-100/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  paymentComplete:
    "bg-emerald-100/85 dark:bg-emerald-950/35 hover:bg-emerald-100 dark:hover:bg-emerald-950/45",
  reconcile:
    "bg-orange-100/90 dark:bg-orange-950/35 hover:bg-orange-100 dark:hover:bg-orange-950/45",
  cancel:
    "bg-red-100/85 dark:bg-red-950/35 hover:bg-red-100 dark:hover:bg-red-950/45",
};

const HIGHLIGHT_SWATCH: Record<AdminAllHighlightId, string> = {
  inquiry: "bg-white ring-1 ring-inset ring-border dark:bg-zinc-800 dark:ring-zinc-600",
  depositIn: "bg-amber-400",
  paymentComplete: "bg-emerald-500",
  reconcile: "bg-orange-400",
  cancel: "bg-red-400",
};

export const ADMIN_ALL_HIGHLIGHT_LEGEND: Record<AdminAllHighlightId, string> = {
  inquiry: "Inquiry",
  depositIn: "Deposit In",
  paymentComplete: "Payment Complete",
  reconcile: "Reconcile/dispute",
  cancel: "Cancel",
};

function normalizeStoredHighlightKey(
  key: string | null | undefined
): AdminAllHighlightId | undefined {
  if (!key) return undefined;
  if ((ADMIN_ALL_HIGHLIGHT_IDS as readonly string[]).includes(key)) {
    return key as AdminAllHighlightId;
  }
  return LEGACY_HIGHLIGHT_MAP[key];
}

export function adminAllHighlightRowClass(
  key: string | null | undefined
): string | undefined {
  const normalized = normalizeStoredHighlightKey(key);
  if (!normalized) return undefined;
  return HIGHLIGHT_ROW[normalized];
}

export function adminAllHighlightSwatchClass(key: AdminAllHighlightId): string {
  return HIGHLIGHT_SWATCH[key];
}

export function isAdminAllHighlightId(v: string): v is AdminAllHighlightId {
  return (ADMIN_ALL_HIGHLIGHT_IDS as readonly string[]).includes(v);
}
