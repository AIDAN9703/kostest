import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, Heart, Calendar, Compass, ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Suspense } from "react";
import { UserProfile } from "@/types/types";

// Quick action card component
const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string;
}) => (
  <Link href={href}>
    <Card className="h-full border hover:shadow-sm transition-all bg-primary/5 group">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-full bg-white">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-primary">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  </Link>
);

// Featured boats section component
const FeaturedBoatsSection = ({ featuredBoats = [] }: { featuredBoats?: any[] }) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-medium text-gray-900">Featured Boats</h2>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-primary text-sm p-0"
        asChild
      >
        <Link href="/boats">
          View All <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
    
    {featuredBoats.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Boat cards would be rendered here */}
      </div>
    ) : (
      <Card className="border-dashed border-gray-200 bg-white">
        <CardContent className="py-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Ship className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-medium text-gray-900">Discover Amazing Boats</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">
            Browse our selection of boats for your next adventure.
          </p>
          <Button className="bg-primary text-white" size="sm" asChild>
            <Link href="/boats">
              Browse Boats
            </Link>
          </Button>
        </CardContent>
      </Card>
    )}
  </div>
);

// Upcoming booking section component
const UpcomingBookingSection = () => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-medium text-gray-900">Upcoming Booking</h2>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-primary text-sm p-0"
        asChild
      >
        <Link href="/profile/bookings">
          View All <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
    
    <Card className="border-gray-200">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="bg-primary/10 p-4 sm:p-6 sm:w-1/3 flex flex-col items-center text-center">
            <CalendarDays className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-base font-medium text-gray-900">No Upcoming Bookings</h3>
            <p className="text-xs text-gray-500 mt-1">Ready for your next adventure?</p>
          </div>
          <div className="p-4 sm:p-6 sm:w-2/3">
            <p className="text-sm text-gray-600 mb-3">
              You don't have any upcoming boat reservations. Browse our selection of boats for your next adventure.
            </p>
            <Button className="bg-primary text-white w-full sm:w-auto" size="sm" asChild>
              <Link href="/boats">
                Find a Boat
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Welcome message component
const WelcomeMessage = ({ firstName }: { firstName?: string | null }) => (
  <div className="bg-gradient-to-r from-primary/90 to-primary rounded-lg p-4 md:p-6 text-white shadow-sm">
    <h1 className="text-xl md:text-2xl font-bold">Welcome back, {firstName || 'there'}!</h1>
    <p className="mt-1 text-white/90 text-sm md:text-base">What would you like to do today?</p>
  </div>
);

// Quick actions grid component
const QuickActionsGrid = ({ user }: { user: any }) => {
  const quickActions = [
    {
      title: "Find a Boat",
      description: "Browse available boats",
      icon: <Compass className="h-5 w-5 text-primary" />,
      href: "/boats",
    },
    {
      title: "My Bookings",
      description: "View your bookings",
      icon: <Calendar className="h-5 w-5 text-primary" />,
      href: "/profile/bookings",
    },
    {
      title: "Favorites",
      description: "Your saved boats",
      icon: <Heart className="h-5 w-5 text-primary" />,
      href: "/profile/favorites",
    },
    {
      title: "My Boats",
      description: "Manage your listings",
      icon: <Ship className="h-5 w-5 text-primary" />,
      href: "/profile/boats",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {quickActions.map((action, index) => (
        <QuickActionCard
          key={index}
          title={action.title}
          description={action.description}
          icon={action.icon}
          href={action.href}
        />
      ))}
    </div>
  );
};

// Dashboard content component
const DashboardContent = ({ user }: { user: any }) => (
  <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6 animate-fadeIn">
    {/* Profile Header */}
    <ProfileHeader user={user} />
    
    {/* Welcome Message */}
    <WelcomeMessage firstName={user?.firstName} />
    
    {/* Quick Actions */}
    <QuickActionsGrid user={user} />
    
    {/* Featured Section */}
    <FeaturedBoatsSection />
    
    {/* Upcoming Booking */}
    <UpcomingBookingSection />
  </div>
);

// Loading fallback component
const DashboardSkeleton = () => (
  <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6">
    <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
    <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
      ))}
    </div>
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
    <div className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
  </div>
);

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

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent user={user} />
    </Suspense>
  );
} 