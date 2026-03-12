"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Anchor, Ship, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

interface CaptainDashboardProps {
  userId: string;
}

/**
 * Captain Dashboard Component
 * 
 * Placeholder component for captain-specific features.
 * This will be expanded when captain features are implemented.
 * 
 * Features to add:
 * - Upcoming assignments
 * - Captain availability calendar
 * - Earnings summary
 * - Captain profile completion
 * - License verification status
 * - Performance metrics
 */
export function CaptainDashboard({ userId }: CaptainDashboardProps) {
  return (
    <Card className="md:bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Anchor className="h-5 w-5 text-blue-600" />
          <CardTitle>Captain Dashboard</CardTitle>
        </div>
        <CardDescription>
          Manage your captain profile and assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">$0</div>
            <div className="text-sm text-muted-foreground">Earnings</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-muted-foreground">Rating</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/captain/availability">
              <Calendar className="h-4 w-4 mr-2" />
              Set Availability
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/captain/profile">
              <Ship className="h-4 w-4 mr-2" />
              Complete Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/captain/earnings">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Earnings
            </Link>
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Coming Soon:</strong> Full captain dashboard with assignment management, 
            availability calendar, earnings tracking, and performance metrics.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
