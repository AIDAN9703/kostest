"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Home, DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

interface OwnerDashboardProps {
  userId: string;
}

/**
 * Owner Dashboard Component
 * 
 * Placeholder component for owner-specific features.
 * This will be expanded when owner features are implemented.
 * 
 * Features to add:
 * - Fleet overview (boats listed)
 * - Booking calendar
 * - Revenue analytics
 * - Payout management
 * - Boat management
 * - Performance metrics
 */
export function OwnerDashboard({ userId }: OwnerDashboardProps) {
  return (
    <Card className="md:bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-green-600" />
          <CardTitle>Owner Dashboard</CardTitle>
        </div>
        <CardDescription>
          Manage your fleet and track your business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-muted-foreground">Boats Listed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">Active Bookings</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">$0</div>
            <div className="text-sm text-muted-foreground">Revenue</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0%</div>
            <div className="text-sm text-muted-foreground">Occupancy</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/boats/new">
              <Plus className="h-4 w-4 mr-2" />
              List New Boat
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/owner/fleet">
              <Home className="h-4 w-4 mr-2" />
              Manage Fleet
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/owner/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Booking Calendar
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/owner/earnings">
              <DollarSign className="h-4 w-4 mr-2" />
              View Earnings
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/owner/analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Coming Soon:</strong> Full owner dashboard with fleet management, 
            booking calendar, revenue analytics, payout tracking, and performance insights.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
