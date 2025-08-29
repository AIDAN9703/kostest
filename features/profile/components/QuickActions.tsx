"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Ship, Heart, Calendar, Compass, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/utils/general-utils";
import { useState, useEffect } from "react";

const QuickActionButton = ({ 
  title, 
  description, 
  icon, 
  href,
  variant = "default",
  index = 0
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string;
  variant?: "default" | "primary";
  index?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link href={href} className="block">
      <Card 
        className={cn(
          "h-full transition-all duration-500 border-0 cursor-pointer group relative overflow-hidden transform",
          variant === "primary" 
            ? "bg-linear-to-br from-primary via-primary/95 to-primary/90 text-white hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl" 
            : "bg-linear-to-br from-white to-gray-50/50 hover:from-gray-50 hover:to-white shadow-xs hover:shadow-lg",
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-8",
          "hover:-translate-y-2 hover:scale-[1.02]"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background effects */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          variant === "primary" 
            ? "bg-linear-to-r from-white/10 to-transparent" 
            : "bg-linear-to-r from-primary/5 to-transparent"
        )}></div>
        
        {/* Sparkle effect for primary variant */}
        {variant === "primary" && isHovered && (
          <>
            <Sparkles className="absolute top-4 right-4 h-4 w-4 text-white/60 animate-pulse" />
            <Sparkles className="absolute bottom-6 left-6 h-3 w-3 text-white/40 animate-pulse delay-300" />
          </>
        )}

        <CardContent className="p-6 text-center space-y-4 relative z-10">
          <div className={cn(
            "h-16 w-16 rounded-full mx-auto flex items-center justify-center transition-all duration-500 relative",
            variant === "primary" ? "bg-white/20" : "bg-primary/10",
            "group-hover:scale-110 group-hover:rotate-12"
          )}>
            {/* Icon glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md",
              variant === "primary" ? "bg-white/30" : "bg-primary/30"
            )}></div>
            
            <div className={cn(
              "transition-all duration-300 relative z-10",
              variant === "primary" ? "text-white" : "text-primary group-hover:text-primary/80"
            )}>
              {icon}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-lg transition-all duration-300",
              variant === "primary" ? "text-white" : "text-gray-900 group-hover:text-primary"
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-sm transition-colors duration-300",
              variant === "primary" ? "text-white/80" : "text-muted-foreground group-hover:text-gray-600"
            )}>
              {description}
            </p>
          </div>
          
          <ArrowRight className={cn(
            "h-5 w-5 mx-auto transition-all duration-500 transform",
            variant === "primary" ? "text-white" : "text-primary",
            isHovered 
              ? "opacity-100 translate-x-2 scale-110" 
              : "opacity-0 translate-x-0 scale-100"
          )} />
        </CardContent>

        {/* Bottom border animation */}
        <div className={cn(
          "absolute bottom-0 left-0 h-1 transition-all duration-500 ease-out",
          variant === "primary" 
            ? "bg-white/30" 
            : "bg-linear-to-r from-primary to-primary/60",
          isHovered ? "w-full" : "w-0"
        )}></div>
      </Card>
    </Link>
  );
};

export default function QuickActions() {
  const quickActions = [
    {
      title: "Book a Trip",
      description: "Find and book your next adventure",
      icon: <Compass className="h-8 w-8" />,
      href: "/boats/search",
      variant: "primary" as const,
    },
    {
      title: "My Bookings",
      description: "View and manage your trips",
      icon: <Calendar className="h-8 w-8" />,
      href: "/profile/bookings",
    },
    {
      title: "Favorites",
      description: "Your saved boats and experiences",
      icon: <Heart className="h-8 w-8" />,
      href: "/profile/favorites",
    },
    {
      title: "My Fleet",
      description: "Manage your boat listings",
      icon: <Ship className="h-8 w-8" />,
      href: "/profile/boats",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
          <p className="text-muted-foreground">Everything you need at your fingertips</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
          <div className="h-2 w-2 rounded-full bg-primary/30 animate-pulse delay-300"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <QuickActionButton key={index} {...action} index={index} />
        ))}
      </div>
    </div>
  );
} 