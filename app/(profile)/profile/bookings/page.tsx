import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCard, Booking } from "@/components/profile/BookingCard";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarX2 } from "lucide-react";

export default async function BookingsPage() {
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

  // Empty bookings array
  const bookings: Booking[] = [];
  const upcomingBookings: Booking[] = [];
  const pastBookings: Booking[] = [];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Manage your boat reservations</p>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-6">
          <EmptyState 
            icon={CalendarX2}
            title="No upcoming bookings"
            description="You don't have any upcoming boat reservations. Browse boats and book your next adventure!"
            actionLabel="Browse Boats"
            actionHref="/boats"
            iconClassName="bg-primary/10 text-primary"
          />
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6">
          <EmptyState 
            icon={CalendarX2}
            title="No past bookings"
            description="You don't have any past boat reservations. Book your first boat adventure!"
            actionLabel="Browse Boats"
            actionHref="/boats"
            iconClassName="bg-primary/10 text-primary"
          />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-6">
          <EmptyState 
            icon={CalendarX2}
            title="No bookings found"
            description="You haven't made any boat reservations yet. Start exploring available boats!"
            actionLabel="Browse Boats"
            actionHref="/boats"
            iconClassName="bg-primary/10 text-primary"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}