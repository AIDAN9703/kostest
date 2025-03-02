import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { CalendarDays, Ship, CreditCard, MessageSquare, Heart } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileActivity from "@/components/profile/ProfileActivity";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarX2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  // Fetch user data from database to get complete profile
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const user = userData[0] || null;

  // Define empty stats
  const stats = [
    {
      title: "Total Bookings",
      value: user?.totalBookings || 0,
      icon: "calendar-days",
      description: "Lifetime bookings",
      change: "",
      trend: "neutral" as const,
    },
    {
      title: "Favorite Boats",
      value: 0,
      icon: "heart",
      description: "Saved boats",
      change: "",
      trend: "neutral" as const,
    },
    {
      title: "Unread Messages",
      value: 0,
      icon: "message-square",
      description: "Pending responses",
      change: "",
      trend: "neutral" as const,
    },
    {
      title: "Boats Listed",
      value: user?.totalBoatsListed || 0,
      icon: "ship",
      description: "Active listings",
      change: "",
      trend: "neutral" as const,
    },
  ];

  // Empty activity array
  const recentActivity = [];

  // Empty bookings array
  const upcomingBookings = [];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 animate-fadeIn">
      <ProfileHeader user={user} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="transition-all duration-200">Overview</TabsTrigger>
          <TabsTrigger value="bookings" className="transition-all duration-200">Bookings</TabsTrigger>
          <TabsTrigger value="activity" className="transition-all duration-200">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 animate-fadeIn">
          <ProfileStats stats={stats} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Upcoming Bookings
                </CardTitle>
                <CardDescription>Your next scheduled trips</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <EmptyState 
                  icon={CalendarX2}
                  title="No upcoming bookings"
                  description="You don't have any upcoming boat reservations. Browse boats and book your next adventure!"
                  actionLabel="Browse Boats"
                  actionHref="/boats"
                  iconClassName="bg-primary/10 text-primary"
                />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest actions and notifications</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <EmptyState 
                  icon={Activity}
                  title="No recent activity"
                  description="You don't have any recent activity. As you use the platform, your actions will appear here."
                  iconClassName="bg-primary/10 text-primary"
                />
              </CardContent>
            </Card>
          </div>
          
          <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    Recommended Boats
                  </CardTitle>
                  <CardDescription>Personalized recommendations based on your preferences</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-amber-200 text-amber-800 hover:bg-amber-50">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <EmptyState 
                icon={Ship}
                title="Recommendations coming soon"
                description="We're personalizing boat recommendations for you. Check back soon or browse our available boats."
                actionLabel="Browse Boats"
                actionHref="/boats"
                iconClassName="bg-primary/10 text-primary"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings" className="animate-fadeIn">
          <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                All Bookings
              </CardTitle>
              <CardDescription>View and manage all your bookings</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <EmptyState 
                icon={CalendarX2}
                title="No bookings found"
                description="You haven't made any boat reservations yet. Start exploring available boats!"
                actionLabel="Browse Boats"
                actionHref="/boats"
                iconClassName="bg-primary/10 text-primary"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="animate-fadeIn">
          <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Activity History
              </CardTitle>
              <CardDescription>Your recent actions and notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <EmptyState 
                icon={Activity}
                title="No activity history"
                description="Your activity history will appear here as you interact with the platform."
                iconClassName="bg-primary/10 text-primary"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 