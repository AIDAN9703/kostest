import { Calendar, Users, DollarSign, Eye } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface StatsCardsProps {
  stats: {
    totalEvents: number;
    activeEvents: number;
    ticketsSold: number;
    totalRevenue: number;
  };
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      label: "Active Events", 
      value: stats.activeEvents,
      icon: Eye,
      color: "text-green-600",
    },
    {
      label: "Total Tickets Sold",
      value: stats.ticketsSold,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
