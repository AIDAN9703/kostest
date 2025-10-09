import { Ship, Users, ArrowUpRight, ArrowDownRight, BarChart, DollarSign } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/features-admin/_shared/actions/dashboard";
import AdminTodo from "@/features-admin/dashboard/AdminTodo";
import { SectionCard } from "@/features-admin/_shared/components/SectionCard";
import { EmptyState } from "@/features-admin/_shared/components/EmptyState";
import { cn, formatCurrency } from "@/shared/utils/general-utils";
import { COLOR_THEMES, type ColorTheme } from "@/shared/constants";

export const revalidate = 300;

// Metric card configuration
const METRIC_CARDS = [
  {
    title: "Fleet Size",
    subtitle: "Active yachts",
    emoji: "🚤",
    href: "/admin/boats",
    theme: "blue" as ColorTheme,
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => stats.totalBoats,
    getTrend: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => stats.comparisonStats.boatsTrend,
  },
  {
    title: "Users",
    subtitle: "Registered customers",
    emoji: "🏄",
    href: "/admin/users",
    theme: "emerald" as ColorTheme,
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => stats.totalUsers,
    getTrend: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => stats.comparisonStats.usersTrend,
  },
  {
    title: "Bookings",
    subtitle: "This month",
    emoji: "📊",
    href: "/admin/bookings",
    theme: "purple" as ColorTheme,
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => stats.bookingsThisMonth,
    getTrend: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => stats.comparisonStats.bookingsTrend,
  },
  {
    title: "Revenue",
    subtitle: "This month",
    emoji: "💰",
    href: "/admin/finance",
    theme: "amber" as ColorTheme,
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => formatCurrency(stats.revenueThisMonth),
    getTrend: (stats: Awaited<ReturnType<typeof getDashboardStats>>) => stats.comparisonStats.revenueTrend,
    skipFormat: true,
  },
] as const;

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
  const formatTrend = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-xs border border-gray-200/70 p-6">
      <div className="flex-1 flex flex-col space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome back 👋</h1>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METRIC_CARDS.map((config) => {
            const value = config.getValue(stats);
            const trend = config.getTrend(stats);
            const displayValue = 'skipFormat' in config && config.skipFormat ? value : formatNumber(Number(value));
            
            return (
              <MetricCard
                key={config.href}
                title={config.title}
                value={String(displayValue)}
                subtitle={config.subtitle}
                emoji={config.emoji}
                linkHref={config.href}
                colorTheme={config.theme}
                trend={{ delta: formatTrend(trend.value), isPositive: trend.isPositive }}
              />
            );
          })}
        </div>

        {/* Dashboard Sections */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          <div className="lg:col-span-2 flex flex-col min-h-[400px]">
            <SectionCard
              title="Recent Messages"
              subtitle="Customer inquiries and support"
            >
              <div className="flex-1 flex items-center justify-center p-8">
                <EmptyState
                  emoji="📨"
                  title="Coming Soon"
                  description="View and respond to customer inquiries directly from your dashboard"
                />
              </div>
            </SectionCard>
          </div>

          <div className="flex flex-col min-h-[400px]">
            <SectionCard title="Tasks" subtitle="Your admin checklist">
              <div className="flex-1 p-6 overflow-y-auto">
                <AdminTodo />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// MetricCard Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  emoji: string;
  linkHref: string;
  colorTheme: ColorTheme;
  trend?: { delta: string; isPositive: boolean };
}

function MetricCard({ title, value, subtitle, emoji, linkHref, colorTheme, trend }: MetricCardProps) {
  const colors = COLOR_THEMES[colorTheme];

  return (
    <Link href={linkHref} className="group block">
      <div className={cn(
        "bg-white border border-gray-200/70 shadow-xs rounded-2xl p-4 hover:shadow-lg transition-all duration-200",
        colors.border
      )}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
          <span className="text-lg">{emoji}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold", colors.value)}>{value}</span>
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.isPositive ? "text-emerald-600" : "text-red-600"
            )}>
              {trend.isPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
              <span>{trend.delta}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium mt-2">{subtitle}</p>
      </div>
    </Link>
  );
}
