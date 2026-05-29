import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/shared/components/ui/button";
import {
  getOperationsMtdSummary,
  getCharterSourceBreakdownMtd,
  getFollowUpInquiries,
  getTodaysBookings,
  getWeeksBookings,
  type OperationsMtdSummary,
} from "@/features/admin/dashboard";
import { FollowUpsSection } from "@/features/admin/dashboard/FollowUpsSection";
import { RevenueBySourceSection } from "@/features/admin/dashboard/RevenueBySourceSection";
import { TodaysBookingsSection } from "@/features/admin/dashboard/TodaysBookingsSection";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { format } from "date-fns";

const OPS_METRIC_CARDS: {
  title: string;
  href: string;
  getValue: (ops: OperationsMtdSummary) => string;
}[] = [
  {
    title: "Charter GMV (MTD)",
    href: "/admin/bookings",
    getValue: (ops) => formatCentsAsCurrency(ops.gmvMtdCents),
  },
  {
    title: "Net revenue (MTD)",
    href: "/admin/bookings",
    getValue: (ops) => formatCentsAsCurrency(ops.netRevenueMtdCents),
  },
  {
    title: "Commissions (MTD)",
    href: "/admin/bookings",
    getValue: (ops) => formatCentsAsCurrency(ops.commissionsMtdCents),
  },
  {
    title: "Client balance owed",
    href: "/admin/bookings",
    getValue: (ops) =>
      ops.outstandingClientBalanceCount === 0 ? "0" : String(ops.outstandingClientBalanceCount),
  },
];

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(/\s+/)[0];
  const welcomeTitle = firstName ? `Welcome back, ${firstName}` : "Welcome back";

  const monthLabel = format(new Date(), "MMMM yyyy");

  const [ops, sourceRows, followUps, todaysBookings, weeksBookings] = await Promise.all([
    getOperationsMtdSummary(),
    getCharterSourceBreakdownMtd(),
    getFollowUpInquiries(6),
    getTodaysBookings(),
    getWeeksBookings(),
  ]);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{welcomeTitle} 👋</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s moving across the fleet</p>
        </div>
        <Button asChild className="shrink-0 gap-1.5">
          <Link href="/admin/bookings/create">
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </Button>
      </header>

      <MetricCards ops={ops} />

      <div className="grid min-h-0 grid-cols-1 gap-6 lg:max-h-[min(42rem,calc(100svh-12rem))] lg:grid-cols-3 lg:items-stretch lg:overflow-hidden">
        <div className="flex min-h-0 flex-col lg:col-span-2 lg:h-full lg:min-h-0">
          <TodaysBookingsSection todaysBookings={todaysBookings} weeksBookings={weeksBookings} />
        </div>
        <div className="flex min-h-0 flex-col lg:h-full lg:min-h-0">
          <FollowUpsSection inquiries={followUps} compact />
        </div>
      </div>

      <RevenueBySourceSection rows={sourceRows} monthLabel={monthLabel} />
    </div>
  );
}

function MetricCards({ ops }: { ops: OperationsMtdSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {OPS_METRIC_CARDS.map((config) => {
        const value = config.getValue(ops);

        return (
          <MetricCard
            key={config.title}
            title={config.title}
            value={value}
            linkHref={config.href}
          />
        );
      })}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  linkHref: string;
}

function MetricCard({ title, value, linkHref }: MetricCardProps) {
  return (
    <Link
      href={linkHref}
      className="group isolate block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-primary/25 hover:shadow-md">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[38%] bg-gradient-to-t from-primary/18 via-primary/8 to-transparent dark:from-primary/22 dark:via-primary/10"
          aria-hidden
        />
        <div className="relative z-[1] px-5 pb-5 pt-5">
          <h2 className="text-sm font-semibold leading-snug text-muted-foreground">{title}</h2>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </Link>
  );
}
