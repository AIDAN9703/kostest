import Link from "next/link";
import {
  getDashboardStats,
  type DashboardStats,
  getRecentInquiries,
  getTopBlogPosts,
  getTodaysBookings,
  getWeeksBookings,
} from "@/features/admin/dashboard";
import { NewInquiriesTable } from "@/features/admin/dashboard/NewInquiriesTable";
import { TodaysBookingsSection } from "@/features/admin/dashboard/TodaysBookingsSection";
import { SectionCard } from "@/shared/components/SectionCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";

const METRIC_CARDS = [
  {
    title: "Fleet Size",
    subtitle: "Active yachts",
    emoji: "🚤",
    href: "/admin/boats",
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) =>
      stats.totalBoats,
  },
  {
    title: "Users",
    subtitle: "User accounts",
    emoji: "🏄",
    href: "/admin/users",
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) =>
      stats.totalUsers,
  },
  {
    title: "Bookings",
    subtitle: "This month",
    emoji: "📊",
    href: "/admin/bookings",
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) =>
      stats.bookingsThisMonth,
  },
  {
    title: "Booking Value",
    subtitle: "This month",
    emoji: "💰",
    href: "/admin/finance",
    getValue: (stats: Awaited<ReturnType<typeof getDashboardStats>>) =>
      formatCentsAsCurrency(stats.revenueThisMonthCents),
    skipFormat: true,
  },
] as const;

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function AdminDashboardPage() {
  const [stats, inquiries, blogPosts, todaysBookings, weeksBookings] =
    await Promise.all([
      getDashboardStats(),
      getRecentInquiries(5),
      getTopBlogPosts(4),
      getTodaysBookings(),
      getWeeksBookings(),
    ]);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back 👋
        </h1>
      </header>

      <MetricCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewInquiriesTable inquiries={inquiries} />
        <TodaysBookingsSection
          todaysBookings={todaysBookings}
          weeksBookings={weeksBookings}
        />
      </div>

      <MarketingSection blogPosts={blogPosts} />
    </div>
  );
}

// ============================================================================
// SECTIONS
// ============================================================================

function MetricCards({
  stats,
}: {
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
}) {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {METRIC_CARDS.map((config) => {
        const value = config.getValue(stats);
        const displayValue =
          "skipFormat" in config && config.skipFormat
            ? value
            : formatNumber(Number(value));

        return (
          <MetricCard
            key={config.href}
            title={config.title}
            value={String(displayValue)}
            subtitle={config.subtitle}
            emoji={config.emoji}
            linkHref={config.href}
          />
        );
      })}
    </div>
  );
}

function MarketingSection({
  blogPosts,
}: {
  blogPosts: Awaited<ReturnType<typeof getTopBlogPosts>>;
}) {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  return (
    <SectionCard title="Marketing" subtitle="Content and events">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <div className="text-sm font-semibold text-foreground mb-3">
            Top blog posts
          </div>
          {blogPosts.length === 0 ? (
            <EmptyState
              emoji="📰"
              title="No posts yet"
              description="Publish a blog post to see performance."
            />
          ) : (
            <div className="space-y-3">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}/edit`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-muted/20"
                >
                  <span className="font-medium text-foreground">
                    {post.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(post.viewCount)} views
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold text-foreground mb-3">
            Events
          </div>
          <EmptyState
            emoji="🎉"
            title="No active events"
            description="Events will appear here once scheduled."
          />
        </div>
      </div>
    </SectionCard>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  emoji: string;
  linkHref: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  emoji,
  linkHref,
}: MetricCardProps) {
  return (
    <Link href={linkHref} className="group block">
      <div className="bg-card border shadow-sm rounded-2xl p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {title}
          </h3>
          <span className="text-lg text-muted-foreground">{emoji}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground">
            {value}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium mt-2">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
