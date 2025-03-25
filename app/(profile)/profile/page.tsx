import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, Heart, Calendar, Compass, ArrowRight, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Suspense } from "react";
import { auth } from "@/auth";

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
    <Card className="h-full border border-primary/10 hover:shadow-sm transition-all bg-white group">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/5">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-primary">{title}</h3>
          <p className="text-xs text-primary/70">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  </Link>
);


// Upcoming booking section component
const UpcomingBookingSection = ({ bookings = [] }: { bookings?: any[] }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Your Upcoming Trips</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-primary/20 text-primary hover:bg-primary/5"
          asChild
        >
          <Link href="/bookings">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      {bookings && bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-4 border border-primary/10 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-primary/5 overflow-hidden">
                  {booking.boat?.images?.[0] ? (
                    <img 
                      src={booking.boat.images[0]} 
                      alt={booking.boat.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary/40">
                      <Ship className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-primary mb-1">
                    {booking.boat?.name || 'Boat Trip'}
                  </h3>
                  
                  <div className="flex items-center text-primary/70 text-sm gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(booking.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-primary/70 text-sm gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{booking.duration || '3'} hours</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 text-center border border-primary/10">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-base font-medium text-primary mb-2">No upcoming trips</h3>
          <p className="text-sm text-primary/70 mb-4">
            Browse available boats and schedule your next adventure on the water.
          </p>
          <Button 
            asChild
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Link href="/boats">Explore Boats</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

// Welcome message component
const WelcomeMessage = ({ firstName, lastName }: { firstName?: string | null, lastName?: string | null }) => (
  <div className="bg-gradient-to-r from-primary/80 to-primary rounded-xl p-5 md:p-7 text-white shadow-md border border-white/10 backdrop-blur-sm relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
    <div className="relative z-10">
      <h1 className="text-xl md:text-3xl font-bold tracking-tight">
        Welcome back, <span className="text-white/95 underline decoration-2 underline-offset-4 decoration-white/30">{firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Sailor'}</span>!
      </h1>
      <p className="mt-2 text-white/90 text-sm md:text-base font-light">
        Ready for your next adventure on the water? Let's get started.
      </p>
    </div>
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
  <div className=" px-4 md:px-6">
    <ProfileHeader user={user} />
    
    <div className="mt-6">
      <WelcomeMessage 
        firstName={user?.firstName} 
        lastName={user?.lastName}
      />
    </div>
    
    <div className="mt-6">
      <QuickActionsGrid user={user} />
    </div>
    
    <div className="mt-6">
      <UpcomingBookingSection bookings={user?.bookings} />
    </div>
  </div>
);

// Loading fallback component
const DashboardSkeleton = () => (
  <div className="p-4 pt-16 md:p-6 lg:pt-6 bg-white/50">
    <div className="max-w-5xl mx-auto w-full">
      <div className="h-40 bg-primary/5 animate-pulse rounded-lg"></div>
      <div className="h-24 bg-primary/5 animate-pulse rounded-lg mt-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-primary/5 animate-pulse rounded-lg"></div>
        ))}
      </div>
      <div className="h-64 bg-primary/5 animate-pulse rounded-lg mt-6"></div>
      <div className="h-48 bg-primary/5 animate-pulse rounded-lg mt-6"></div>
    </div>
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