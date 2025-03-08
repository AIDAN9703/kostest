import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCard, Booking } from "@/components/profile/BookingCard";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6 animate-fadeIn">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-lg p-4 md:p-6 text-white shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Bookings</h1>
            <p className="mt-1 text-white/90 text-sm md:text-base">Manage your boat reservations</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            asChild
          >
            <Link href="/boats">
              Find <span className="hidden sm:inline">a Boat</span> <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs sm:text-sm">
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({bookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="animate-fadeIn">
          <Card className="border-dashed border-gray-200 bg-white">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-medium text-gray-900">No upcoming bookings</h3>
              <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">
                You don't have any upcoming boat reservations. Browse boats and book your next adventure!
              </p>
              <Button className="bg-primary text-white" size="sm" asChild>
                <Link href="/boats">
                  Browse Boats
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past" className="animate-fadeIn">
          <Card className="border-dashed border-gray-200 bg-white">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-medium text-gray-900">No past bookings</h3>
              <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">
                You don't have any past boat reservations. Book your first boat adventure!
              </p>
              <Button className="bg-primary text-white" size="sm" asChild>
                <Link href="/boats">
                  Browse Boats
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="animate-fadeIn">
          <Card className="border-dashed border-gray-200 bg-white">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-medium text-gray-900">No bookings found</h3>
              <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">
                You haven't made any boat reservations yet. Start exploring available boats!
              </p>
              <Button className="bg-primary text-white" size="sm" asChild>
                <Link href="/boats">
                  Browse Boats
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}