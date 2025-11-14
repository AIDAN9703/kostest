"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Heart, Calendar, Compass } from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Book a Trip",
    description: "Find and book your next adventure",
    icon: Compass,
    href: "/boats/search",
  },
  {
    title: "My Bookings",
    description: "View and manage your trips",
    icon: Calendar,
    href: "/profile/bookings",
  },
  {
    title: "Favorites",
    description: "Your saved boats",
    icon: Heart,
    href: "/profile/favorites",
  },
];

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 