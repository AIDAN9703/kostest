"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Calendar, Heart, Waves, Trophy, TrendingUp, Ship } from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { useEffect, useState } from "react";

interface StatsData {
  totalBookings: number;
  favoriteBoats: number;
  hoursOnWater: number;
  loyaltyPoints: number;
  totalBoatsListed: number;
}

interface ProfileStatsProps {
  stats: StatsData;
}

const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "up",
  index = 0
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  icon: React.ReactNode; 
  trend?: "up" | "down" | "neutral";
  index?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Animate the number counting up
      const numValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0;
      let current = 0;
      const increment = numValue / 30;
      const counter = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          setAnimatedValue(numValue);
          clearInterval(counter);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, 50);

      return () => clearInterval(counter);
    }, index * 150);

    return () => clearTimeout(timer);
  }, [value, index]);

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-500 border-0 bg-linear-to-br from-white to-gray-50/50 group cursor-pointer transform hover:-translate-y-2",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <CardContent className="p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-gray-700 transition-colors">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                {animatedValue.toLocaleString()}
              </p>
              {change && (
                <span className={cn(
                  "text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0",
                  trend === "up" && "text-green-600",
                  trend === "down" && "text-red-600",
                  trend === "neutral" && "text-gray-600"
                )}>
                  <TrendingUp className="h-3 w-3" />
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
            {icon}
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: isVisible ? `${Math.min((animatedValue / Math.max(value as number, 100)) * 100, 100)}%` : '0%' 
            }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProfileStats({ stats }: ProfileStatsProps) {
  // Build stats array dynamically based on what data we have
  const statsItems = [
    { 
      title: "Total Bookings", 
      value: stats.totalBookings, 
      icon: <Calendar className="h-6 w-6" /> 
    },
    ...(stats.totalBoatsListed > 0 ? [{
      title: "Boats Listed", 
      value: stats.totalBoatsListed, 
      icon: <Ship className="h-6 w-6" /> 
    }] : []),
    {
      title: "Favorite Boats", 
      value: stats.favoriteBoats, 
      icon: <Heart className="h-6 w-6" /> 
    },
    {
      title: "Hours on Water", 
      value: stats.hoursOnWater, 
      icon: <Waves className="h-6 w-6" /> 
    },
    {
      title: "Loyalty Points", 
      value: stats.loyaltyPoints, 
      icon: <Trophy className="h-6 w-6" /> 
    }
  ];

  // If no meaningful stats, show a welcome message instead
  if (statsItems.length === 1 && stats.totalBookings === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
          <Waves className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to KOS Yachts!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start your boating journey by exploring our amazing fleet or listing your own boat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-6",
      statsItems.length === 1 ? "grid-cols-1 max-w-sm mx-auto" :
      statsItems.length === 2 ? "grid-cols-1 md:grid-cols-2" :
      statsItems.length === 3 ? "grid-cols-1 md:grid-cols-3" :
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    )}>
      {statsItems.map((stat, index) => (
        <StatsCard key={index} {...stat} index={index} />
      ))}
    </div>
  );
} 