import { 
  Ship, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Star, 
  Target,
  BarChart,
  ListChecks,
  Activity,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, getDailyBookings, getDailyRevenue, getRecentActivity, ActivityItem } from "@/features-admin/_shared/actions/dashboard";
import AdminTodo from "@/features-admin/dashboard/AdminTodo";
import { cn, formatCurrency } from "@/shared/utils/general-utils";

// Add route segment config for caching
export const revalidate = 300; // Revalidate every 5 minutes


export default async function AdminDashboardPage() {
  // Fetch dashboard statistics and activity
  const [stats, dailyBookings, dailyRevenue, recentActivity] = await Promise.all([
    getDashboardStats(),
    getDailyBookings(90),
    getDailyRevenue(90),
    getRecentActivity(8)
  ]);
  
  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
  
  // Format trend numbers
  const formatTrend = (value: number) => {
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  
  // Activity type icons and colors
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'booking': return Ship;
      case 'user': return Users;
      case 'completion': return Target;
      case 'inquiry': return Star;
      default: return Activity;
    }
  };
  
  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'booking': return 'text-blue-600';
      case 'user': return 'text-emerald-600';
      case 'completion': return 'text-purple-600';
      case 'inquiry': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };
  


  return (
    <div className="space-y-8">
      {/* Top header: keep it minimal and welcoming */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
          <p className="text-sm text-gray-500">Here's what's happening across KOS today</p>
        </div>
        
        {/* System Status - small and unobtrusive */}
        <div className="flex items-center gap-2 px-2 py-2 text-green-500 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">All Systems Online</span>
        </div>
      </div>

      {/* Vibrant KPI tiles — flat, colorful, yacht-focused */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <VibrantTile
          title="Fleet Size"
          value={formatNumber(stats.totalBoats)}
          subtitle="Active yachts ready to sail"
          icon="🛥️"
          gradient="from-blue-500 via-cyan-500 to-blue-600"
          linkHref="/admin/boats"
          trend={{ delta: formatTrend(stats.comparisonStats.boatsTrend.value), isPositive: stats.comparisonStats.boatsTrend.isPositive }}
        />
        <VibrantTile
          title="Happy Sailors"
          value={formatNumber(stats.totalUsers)}
          subtitle="Registered customers"
          icon="👨🏻‍✈️"
          gradient="from-emerald-500 via-teal-500 to-emerald-600"
          linkHref="/admin/users"
          trend={{ delta: formatTrend(stats.comparisonStats.usersTrend.value), isPositive: stats.comparisonStats.usersTrend.isPositive }}
        />
        <VibrantTile
          title="Ocean Adventures"
          value={formatNumber(stats.bookingsThisMonth)}
          subtitle="Charters this month"
          icon="📅"
          gradient="from-purple-500 via-pink-500 to-purple-600"
          linkHref="/admin/bookings"
          trend={{ delta: formatTrend(stats.comparisonStats.bookingsTrend.value), isPositive: stats.comparisonStats.bookingsTrend.isPositive }}
        />
        <VibrantTile
          title="Golden Waves"
          value={formatCurrency(stats.revenueThisMonth)}
          subtitle="Monthly revenue"
          icon="💵"
          gradient="from-amber-400 via-yellow-500 to-orange-500"
          linkHref="/admin/finance"
          trend={{ delta: formatTrend(stats.comparisonStats.revenueTrend.value), isPositive: stats.comparisonStats.revenueTrend.isPositive }}
        />
      </div>

      {/* Clean Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Activity Feed and Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Feed */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-120 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const color = getActivityColor(activity.type);
                    
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                          <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No recent activity to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Clean Todo Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                <ListChecks className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Task Manager</h3>
            </div>
          </div>
          <div className="p-6">
            <AdminTodo />
          </div>
        </div>
      </div>
    </div>
  );
}

interface VibrantTileProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  gradient: string;
  linkHref: string;
  trend?: { delta: string; isPositive: boolean };
}

function VibrantTile({ title, value, subtitle, icon, gradient, linkHref, trend }: VibrantTileProps) {
  return (
    <Link href={linkHref} className="group block">
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-6 text-white transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl",
        `bg-gradient-to-br ${gradient}`
      )}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-white/10 opacity-30">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/20"></div>
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl opacity-90">{icon}</div>
            {trend && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend.delta}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            <div className="text-3xl font-bold leading-none">{value}</div>
            <p className="text-sm opacity-75">{subtitle}</p>
          </div>
          
          {/* Subtle hover indicator */}
          <div className="mt-4 flex items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View details</span>
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Helper component for metric tiles
interface MetricTileProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function MetricTile({ label, value, change, isPositive }: MetricTileProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
      <div className="text-xs text-gray-600 mb-2">{label}</div>
      <div className="text-lg font-bold text-gray-900 mb-1">{value}</div>
      <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
  );
}

