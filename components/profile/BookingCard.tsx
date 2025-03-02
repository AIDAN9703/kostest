import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, AnchorIcon, MessageSquareIcon, XIcon, StarIcon, RefreshCwIcon } from "lucide-react";

export interface Booking {
  id: string;
  boatName: string;
  boatType: string;
  date: string;
  duration: number;
  location: string;
  guests: number;
  captain: boolean;
  price: number;
  status: string;
  image: string;
}

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const statusColor = {
    confirmed: "bg-green-50 text-green-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
    completed: "bg-gray-50 text-gray-700",
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 md:h-auto md:w-1/3 lg:w-1/4">
          <Image
            src={booking.image}
            alt={booking.boatName}
            fill
            className="object-cover"
          />
        </div>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{booking.boatName}</h3>
                <Badge className={statusColor[booking.status as keyof typeof statusColor]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-500 mb-4">{booking.boatType}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-600">{booking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-600">{booking.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-600">{booking.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-600">{booking.guests} guests</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {booking.captain && (
                  <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50">
                    <AnchorIcon className="h-3 w-3 mr-1" />
                    Captain Included
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${booking.price}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6 justify-end">
            {booking.status === "confirmed" && (
              <>
                <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5">
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  Contact Host
                </Button>
                <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              </>
            )}

            {booking.status === "pending" && (
              <>
                <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5">
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  Contact Host
                </Button>
                <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancel Request
                </Button>
              </>
            )}

            {booking.status === "completed" && (
              <Button variant="outline" size="sm" className="border-amber-200 text-amber-800 hover:bg-amber-50">
                <StarIcon className="h-4 w-4 mr-2" />
                Leave Review
              </Button>
            )}

            {booking.status === "cancelled" && (
              <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Book Again
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
} 