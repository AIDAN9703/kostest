/**
 * Ops UI: source channels, default commission splits vs REV, agent presets.
 * Edit OPS_AGENT_PRESETS to match your team’s agent list.
 */

/** Radix Select cannot use "" — use with SelectItem for “empty”. */
export const OPS_SELECT_NONE = "__ops_none__";
export const OPS_SELECT_CUSTOM = "__ops_custom__";

/** Canonical source values (stored in booking_ops.source_override). */
export const OPS_SOURCE_OPTIONS = [
  "Direct",
  "Referral",
  "Broker",
  "KOS Broker",
  "Boatsetter",
  "KOS Website",
  "GetMyBoat",
  "Boatpass",
  "MYC",
  "Instagram",
  "Phone",
] as const;

export type OpsSource = (typeof OPS_SOURCE_OPTIONS)[number];

/** 70% Agent / 30% KOS */
const SPLIT_AGENT_HEAVY = { agentPct: 0.7, kosPct: 0.3 } as const;
/** 33% KOS / 67% Agent */
const SPLIT_KOS_LEAD = { agentPct: 0.67, kosPct: 0.33 } as const;

const SOURCES_AGENT_HEAVY = new Set<string>(["Direct", "Referral", "Broker"]);
const SOURCES_KOS_LEAD = new Set<string>([
  "KOS Broker",
  "KOS Website",
  "Instagram",
  "Phone",
  "Boatsetter",
  "GetMyBoat",
  "Boatpass",
  "MYC",
]);

/**
 * Match DB / legacy text to a canonical OPS_SOURCE_OPTIONS value (case-insensitive).
 */
export function normalizeOpsSource(raw: string | null | undefined): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  const hit = OPS_SOURCE_OPTIONS.find((o) => o.toLowerCase() === lower);
  return hit ?? s;
}

export function isKnownOpsSource(source: string): source is OpsSource {
  return OPS_SOURCE_OPTIONS.includes(source as OpsSource);
}

export function getCommissionSplitForSource(
  source: string
): { agentPct: number; kosPct: number; label: string } | null {
  const s = normalizeOpsSource(source);
  if (!s) return null;
  if (SOURCES_AGENT_HEAVY.has(s)) {
    return { ...SPLIT_AGENT_HEAVY, label: "70% Agent / 30% KOS" };
  }
  if (SOURCES_KOS_LEAD.has(s)) {
    return { ...SPLIT_KOS_LEAD, label: "33% KOS / 67% Agent" };
  }
  return null;
}

/**
 * Split REV (cents) into commission buckets. Ensures agent + kos = rev (rounding on agent).
 */
export function computeCommissionCentsFromRev(
  revCents: number | null | undefined,
  source: string
): { agentCents: number; kosCents: number } | null {
  if (revCents == null || revCents <= 0) return null;
  const split = getCommissionSplitForSource(source);
  if (!split) return null;
  const agentCents = Math.round(revCents * split.agentPct);
  const kosCents = revCents - agentCents;
  return { agentCents, kosCents };
}

/**
 * Preset agent names for dropdowns (exact strings saved to booking_ops.agent_code).
 * Add your real agents here; leave empty to only use “Other”.
 */
export const OPS_AGENT_PRESETS: readonly string[] = [];
