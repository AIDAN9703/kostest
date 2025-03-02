"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  LucideIcon, 
  CalendarDays, 
  Heart, 
  MessageSquare, 
  Ship, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  // Add any other icons you might need
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map of icon names to their components
const iconMap: Record<string, LucideIcon> = {
  "calendar-days": CalendarDays,
  "heart": Heart,
  "message-square": MessageSquare,
  "ship": Ship,
  // Add any other icons you might need
};

interface StatItem {
  title: string;
  value: number;
  icon: string; // Changed from LucideIcon to string
  description: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

interface ProfileStatsProps {
  stats: StatItem[];
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        // Get the icon component from the map, or use AlertCircle as fallback
        const Icon = iconMap[stat.icon] || AlertCircle;
        
        return (
          <Card 
            key={index} 
            className="group overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300 hover:scale-110",
                    stat.trend === "up" ? "bg-green-50 text-green-600" :
                    stat.trend === "down" ? "bg-red-50 text-red-600" :
                    "bg-primary/10 text-primary"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                </div>
                
                {stat.trend !== "neutral" && (
                  <div className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900 transition-all duration-300 group-hover:text-primary">{stat.value}</div>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfileStats; 