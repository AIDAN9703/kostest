"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MessageSquare, CreditCard, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: number;
  type: "booking" | "message" | "payment" | "favorite";
  title: string;
  description: string;
  date: string;
}

interface ProfileActivityProps {
  activities: Activity[];
}

const ProfileActivity = ({ activities }: ProfileActivityProps) => {
  // Function to get the appropriate icon for each activity type
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "booking":
        return <CalendarDays className="h-5 w-5 text-blue-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      case "favorite":
        return <Heart className="h-5 w-5 text-red-600" />;
      default:
        return <CalendarDays className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-5">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 rounded-full bg-gray-50">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileActivity; 