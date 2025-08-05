import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, CalendarClock, Ship, Users } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/features-admin/_shared/actions/dashboard";

// Add route segment config for caching
export const revalidate = 300; // Revalidate every 5 minutes


export default async function AdminDashboardPage() {
  // Fetch dashboard statistics
  const stats = await getDashboardStats();
  
  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num);
  
  // Format trend numbers
  const formatTrend = (value: number) => {
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Boats" 
          value={formatNumber(stats.totalBoats)} 
          description="Active listings"
          icon={<Ship className="h-5 w-5" />}
          linkHref="/admin/boats"
          trend={{
            value: formatTrend(stats.comparisonStats.boatsTrend.value),
            isPositive: stats.comparisonStats.boatsTrend.isPositive,
            text: "from last month"
          }}
          color="blue"
        />
        <StatsCard 
          title="Active Users" 
          value={formatNumber(stats.totalUsers)} 
          description="Customer accounts"
          icon={<Users className="h-5 w-5" />}
          linkHref="/admin/users"
          trend={{
            value: formatTrend(stats.comparisonStats.usersTrend.value),
            isPositive: stats.comparisonStats.usersTrend.isPositive,
            text: "from last month"
          }}
          color="green"
        />
        <StatsCard 
          title="Bookings" 
          value={formatNumber(stats.bookingsThisMonth)} 
          description="This month"
          icon={<CalendarClock className="h-5 w-5" />}
          linkHref="/admin/bookings"
          trend={{
            value: formatTrend(stats.comparisonStats.bookingsTrend.value),
            isPositive: stats.comparisonStats.bookingsTrend.isPositive,
            text: "from last month"
          }}
          color="purple"
        />
        <StatsCard 
          title="Revenue" 
          value={formatCurrency(stats.revenueThisMonth)} 
          description="This month"
          icon={<BarChart className="h-5 w-5" />}
          linkHref="/admin/finance"
          trend={{
            value: formatTrend(stats.comparisonStats.revenueTrend.value),
            isPositive: stats.comparisonStats.revenueTrend.isPositive,
            text: "from last month"
          }}
          color="amber"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <CalendarClock className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-600">No Recent Activity</h3>
              <p className="text-sm text-gray-500 mt-1">
                Activity logs will appear here as users interact with the platform
              </p>
            </div>
            <div className="mt-4 text-center">
              <Link href="/admin/activity" className="text-sm text-primary hover:underline">
                View all activity
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ActionCard 
                title="Add New Boat" 
                description="Create a new boat listing"
                href="/admin/boats/create"
                icon={<Ship className="h-5 w-5" />}
              />
              <ActionCard 
                title="Add New User" 
                description="Create a user account"
                href="/admin/users/create"
                icon={<Users className="h-5 w-5" />}
              />
              <ActionCard 
                title="Manage Bookings" 
                description="Review and update bookings"
                href="/admin/bookings"
                icon={<CalendarClock className="h-5 w-5" />}
              />
              <ActionCard 
                title="View Reports" 
                description="Analytics and reporting"
                href="/admin/reports"
                icon={<BarChart className="h-5 w-5" />}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  linkHref: string;
  trend: {
    value: string;
    isPositive: boolean;
    text: string;
  };
  color: "blue" | "green" | "red" | "purple" | "amber";
}

function StatsCard({ title, value, description, icon, linkHref, trend, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium text-sm text-gray-500">{title}</div>
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-gray-500">{description}</div>
        <div className="mt-4 flex items-center text-sm">
          <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
            {trend.value}
          </span>
          <span className="ml-1 text-gray-500">{trend.text}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-3"></div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <div className="text-xs text-gray-400 min-w-[80px] text-right">{time}</div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function ActionCard({ title, description, href, icon }: ActionCardProps) {
  return (
    <Link 
      href={href}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 flex items-start space-x-4"
    >
      <div className="mt-1 p-2 bg-primary/10 rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
} 