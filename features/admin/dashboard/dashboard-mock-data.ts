/**
 * Placeholder dashboard data — swap for real loaders when ops/finance
 * aggregations are wired up. Each export is shaped like its future API type.
 */

export interface DashboardRevenuePoint {
  label: string;
  gmvCents: number;
  commissionCents: number;
}

export interface DashboardSourceRow {
  sourceKey: string;
  label: string;
  gmvCents: number;
  bookingCount: number;
  sharePct: number;
}

export interface DashboardOpsAlert {
  id: string;
  severity: "urgent" | "watch";
  title: string;
  detail: string;
  href: string;
  dueLabel?: string;
}

export interface DashboardBalanceRow {
  id: string;
  customerName: string;
  boatName: string;
  charterDate: string;
  balanceCents: number;
  href: string;
}

export interface DashboardOwnerPayoutRow {
  id: string;
  ownerName: string;
  boatName: string;
  balanceCents: number;
  href: string;
}

export interface DashboardTopBoatRow {
  rank: number;
  boatName: string;
  trips: number;
  gmvCents: number;
  /** Share of bookable days chartered this month. */
  utilizationPct: number;
  href: string;
}

/** Rolling 6-month GMV + commission — illustrative trend. */
export const MOCK_REVENUE_TREND: DashboardRevenuePoint[] = [
  { label: "Feb", gmvCents: 842_000_00, commissionCents: 126_300_00 },
  { label: "Mar", gmvCents: 1_180_000_00, commissionCents: 177_000_00 },
  { label: "Apr", gmvCents: 1_420_000_00, commissionCents: 213_000_00 },
  { label: "May", gmvCents: 1_890_000_00, commissionCents: 283_500_00 },
  { label: "Jun", gmvCents: 2_240_000_00, commissionCents: 336_000_00 },
  { label: "Jul", gmvCents: 1_650_000_00, commissionCents: 247_500_00 },
];

/** MTD charter volume by channel — mirrors ops `source_override`. */
export const MOCK_SOURCE_BREAKDOWN: DashboardSourceRow[] = [
  { sourceKey: "direct", label: "Direct / Phone", gmvCents: 620_000_00, bookingCount: 18, sharePct: 38 },
  { sourceKey: "website", label: "Website", gmvCents: 410_000_00, bookingCount: 14, sharePct: 25 },
  { sourceKey: "getmyboat", label: "GetMyBoat", gmvCents: 340_000_00, bookingCount: 11, sharePct: 21 },
  { sourceKey: "boatsetter", label: "Boatsetter", gmvCents: 180_000_00, bookingCount: 6, sharePct: 11 },
  { sourceKey: "broker", label: "Broker", gmvCents: 80_000_00, bookingCount: 3, sharePct: 5 },
];

/** Ops items that need a human before the charter runs smoothly. */
export const MOCK_OPS_ALERTS: DashboardOpsAlert[] = [
  {
    id: "ops-1",
    severity: "urgent",
    title: "No captain assigned",
    detail: "Sunseeker 68 · Martinez party · Sat 10:00 AM",
    href: "/admin/bookings",
    dueLabel: "2 days",
  },
  {
    id: "ops-2",
    severity: "urgent",
    title: "Client balance due",
    detail: "$4,200 owed · Azimut 55 · Jul 12 charter",
    href: "/admin/bookings",
    dueLabel: "5 days",
  },
  {
    id: "ops-3",
    severity: "watch",
    title: "Contract unsigned",
    detail: "Princess 62 · Thompson · Jul 18",
    href: "/admin/bookings",
  },
  {
    id: "ops-4",
    severity: "watch",
    title: "Expenses not logged",
    detail: "Sea Ray 400 · yesterday's charter",
    href: "/admin/bookings",
  },
  {
    id: "ops-5",
    severity: "watch",
    title: "Owner payout pending",
    detail: "$8,750 to send · Viking 64",
    href: "/admin/bookings",
  },
];

export const MOCK_CLIENT_BALANCES: DashboardBalanceRow[] = [
  {
    id: "bal-1",
    customerName: "Sarah Thompson",
    boatName: "Princess 62",
    charterDate: "Jul 18",
    balanceCents: 4_200_00,
    href: "/admin/bookings",
  },
  {
    id: "bal-2",
    customerName: "James Chen",
    boatName: "Azimut 55",
    charterDate: "Jul 12",
    balanceCents: 2_850_00,
    href: "/admin/bookings",
  },
  {
    id: "bal-3",
    customerName: "Maria Rodriguez",
    boatName: "Sunseeker 68",
    charterDate: "Jul 26",
    balanceCents: 1_500_00,
    href: "/admin/bookings",
  },
];

export const MOCK_OWNER_PAYOUTS: DashboardOwnerPayoutRow[] = [
  {
    id: "pay-1",
    ownerName: "Harbor Holdings LLC",
    boatName: "Viking 64",
    balanceCents: 8_750_00,
    href: "/admin/bookings",
  },
  {
    id: "pay-2",
    ownerName: "Coastal Ventures",
    boatName: "Sea Ray 400",
    balanceCents: 3_200_00,
    href: "/admin/bookings",
  },
  {
    id: "pay-3",
    ownerName: "Miami Yacht Group",
    boatName: "Princess 62",
    balanceCents: 2_100_00,
    href: "/admin/bookings",
  },
];

export const MOCK_TOP_BOATS: DashboardTopBoatRow[] = [
  { rank: 1, boatName: "Sunseeker 68 — Miami", trips: 8, gmvCents: 186_000_00, utilizationPct: 74, href: "/admin/boats" },
  { rank: 2, boatName: "Azimut 55 — Fort Lauderdale", trips: 6, gmvCents: 142_000_00, utilizationPct: 61, href: "/admin/boats" },
  { rank: 3, boatName: "Princess 62 — Miami", trips: 5, gmvCents: 118_000_00, utilizationPct: 52, href: "/admin/boats" },
  { rank: 4, boatName: "Viking 64 — Key Largo", trips: 4, gmvCents: 96_000_00, utilizationPct: 44, href: "/admin/boats" },
  { rank: 5, boatName: "Sea Ray 400 — Naples", trips: 4, gmvCents: 72_000_00, utilizationPct: 38, href: "/admin/boats" },
];

/** Aggregate mock headline supplement (balances due). */
export const MOCK_BALANCES_DUE_CENTS = MOCK_CLIENT_BALANCES.reduce(
  (sum, r) => sum + r.balanceCents,
  0
);

export const MOCK_OWNER_PAYOUTS_DUE_CENTS = MOCK_OWNER_PAYOUTS.reduce(
  (sum, r) => sum + r.balanceCents,
  0
);
