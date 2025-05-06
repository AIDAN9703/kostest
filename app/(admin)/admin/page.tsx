import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CalendarClock, Ship, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | KOS Yachts",
  description: "Admin dashboard for KOS Yachts platform",
};

export default async function AdminDashboardPage() {
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
          value="48" 
          description="Active listings"
          icon={<Ship className="h-5 w-5" />}
          linkHref="/admin/boats"
          trend={{
            value: "+4.3%",
            isPositive: true,
            text: "from last month"
          }}
          color="blue"
        />
        <StatsCard 
          title="Active Users" 
          value="2,432" 
          description="Customer accounts"
          icon={<Users className="h-5 w-5" />}
          linkHref="/admin/users"
          trend={{
            value: "+12.1%",
            isPositive: true,
            text: "from last month"
          }}
          color="green"
        />
        <StatsCard 
          title="Bookings" 
          value="356" 
          description="This month"
          icon={<CalendarClock className="h-5 w-5" />}
          linkHref="/admin/bookings"
          trend={{
            value: "+2.5%",
            isPositive: true,
            text: "from last month"
          }}
          color="purple"
        />
        <StatsCard 
          title="Revenue" 
          value="$38,211" 
          description="This month"
          icon={<BarChart className="h-5 w-5" />}
          linkHref="/admin/finance"
          trend={{
            value: "+18.2%",
            isPositive: true,
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
            <div className="space-y-4">
              <ActivityItem
                title="New booking request"
                description="John Doe requested to book 'Luxury Yacht'"
                time="2 hours ago"
              />
              <ActivityItem
                title="User verification"
                description="Jane Smith completed ID verification"
                time="5 hours ago"
              />
              <ActivityItem
                title="New boat listing"
                description="Captain Mike added a new boat 'Ocean Explorer'"
                time="Yesterday"
              />
              <ActivityItem
                title="Payment received"
                description="$1,250 payment for booking #12345"
                time="Yesterday"
              />
              <ActivityItem
                title="New review"
                description="5-star review for 'Paradise Cruiser'"
                time="2 days ago"
              />
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