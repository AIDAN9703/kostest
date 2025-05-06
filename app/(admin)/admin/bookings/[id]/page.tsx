import { Metadata } from "next";
import { CalendarCheck, Check, Clock3, CreditCard, MessageSquare, Ship, User, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/general-utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Booking Details | Admin Dashboard",
  description: "View and manage booking details",
};

// Mock data for a single booking
const booking = {
  id: "B12345",
  customer: {
    id: "user-123",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/avatars/01.png",
  },
  boat: {
    id: "boat-123",
    name: "Ocean Explorer",
    category: "YACHT",
    owner: {
      id: "user-456",
      name: "Captain Mike",
      email: "mike@example.com",
    },
  },
  booking: {
    type: "DAY_REQUEST",
    startDate: "2023-08-15",
    endDate: "2023-08-16",
    startTime: "10:00",
    endTime: "18:00",
    numberOfHours: 8,
    numberOfPassengers: 6,
    status: "CONFIRMED",
    createdAt: "2023-08-01T10:30:00Z",
  },
  location: {
    pickup: "Miami Beach Marina",
    dropoff: "Miami Beach Marina",
    destination: "Biscayne Bay Cruise",
  },
  payment: {
    basePrice: 1000,
    captainFee: 150,
    cleaningFee: 50,
    serviceFee: 50,
    taxAmount: 100,
    totalAmount: 1350,
    depositAmount: 200,
    depositPaid: true,
    status: "PAID",
    method: "Credit Card",
    date: "2023-08-02T15:45:00Z",
    stripePaymentId: "pi_3KH8J9CtXPgHUvSj1MuhR3E2",
  },
  captain: {
    id: "captain-789",
    name: "David Johnson",
    phone: "+1 (555) 987-6543",
  },
  notes: "Customer requested ice and drinks to be available. Will bring own food.",
  timeline: [
    {
      status: "CREATED",
      date: "2023-08-01T10:30:00Z",
      byUser: "John Smith",
    },
    {
      status: "APPROVED",
      date: "2023-08-01T14:20:00Z",
      byUser: "Captain Mike",
    },
    {
      status: "PAYMENT_RECEIVED",
      date: "2023-08-02T15:45:00Z",
      byUser: "System",
    },
    {
      status: "CONFIRMED",
      date: "2023-08-02T15:46:00Z",
      byUser: "System",
    },
  ],
};

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking #{params.id}</h1>
          <p className="text-gray-500 mt-1">
            Created on {new Date(booking.booking.createdAt).toLocaleDateString()} at {new Date(booking.booking.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button>
            Edit Booking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Booking Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <StatusBadge status={booking.booking.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Booking Type</h3>
                  <p className="mt-1">Day Charter</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
                  <p className="mt-1">{booking.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1">
                    {new Date(booking.booking.startDate).toLocaleDateString()} - {new Date(booking.booking.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="mt-1">{booking.booking.startTime} - {booking.booking.endTime} ({booking.booking.numberOfHours} hours)</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Number of Passengers</h3>
                  <p className="mt-1">{booking.booking.numberOfPassengers}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Locations</h3>
                  <div className="mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Pickup</span>
                      <span>{booking.location.pickup}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Dropoff</span>
                      <span>{booking.location.dropoff}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Special Requests</h3>
                <p className="mt-1">{booking.notes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Payment Information</CardTitle>
                <PaymentStatusBadge status={booking.payment.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                    <p className="mt-1">{booking.payment.method}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
                    <p className="mt-1">{new Date(booking.payment.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Stripe Payment ID</h3>
                    <p className="mt-1 text-xs font-mono">{booking.payment.stripePaymentId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Deposit Paid</h3>
                    <p className="mt-1">{booking.payment.depositPaid ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Price Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Price</span>
                      <span>{formatCurrency(booking.payment.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Captain Fee</span>
                      <span>{formatCurrency(booking.payment.captainFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cleaning Fee</span>
                      <span>{formatCurrency(booking.payment.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service Fee</span>
                      <span>{formatCurrency(booking.payment.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax</span>
                      <span>{formatCurrency(booking.payment.taxAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(booking.payment.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timeline Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Booking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking.timeline.map((event, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        {getTimelineIcon(event.status)}
                      </div>
                      {index < booking.timeline.length - 1 && (
                        <div className="h-full w-px bg-gray-200"></div>
                      )}
                    </div>
                    <div className="pb-8">
                      <p className="font-medium">{formatTimelineStatus(event.status)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-500">by {event.byUser}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">{booking.customer.name}</h3>
                  <Link href={`/admin/users/${booking.customer.id}`} className="text-sm text-primary hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Email</h4>
                  <p className="text-sm">{booking.customer.email}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                  <p className="text-sm">{booking.customer.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boat Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Boat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                  <Ship className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium">{booking.boat.name}</h3>
                  <Link href={`/admin/boats/${booking.boat.id}`} className="text-sm text-primary hover:underline">
                    View Boat
                  </Link>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Category</h4>
                  <p className="text-sm">{formatBoatCategory(booking.boat.category)}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Owner</h4>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium">{booking.boat.owner.name}</p>
                    <p className="text-xs text-gray-500">{booking.boat.owner.email}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Link href={`/admin/users/${booking.boat.owner.id}`} className="text-xs text-primary hover:underline">
                    View Owner Profile
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Captain Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Captain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium">{booking.captain.name}</h3>
                  <Link href={`/admin/captains/${booking.captain.id}`} className="text-sm text-primary hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                  <p className="text-sm">{booking.captain.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Customer
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Owner
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Captain
              </Button>
              <Separator className="my-2" />
              <Button className="w-full justify-start text-red-600" variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "CONFIRMED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <X className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Check className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CreditCard className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CreditCard className="h-3 w-3 mr-1" />
          Refunded
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

function getTimelineIcon(status: string) {
  switch (status) {
    case "CREATED":
      return <Clock3 className="h-4 w-4 text-blue-600" />;
    case "APPROVED":
      return <Check className="h-4 w-4 text-green-600" />;
    case "PAYMENT_RECEIVED":
      return <CreditCard className="h-4 w-4 text-green-600" />;
    case "CONFIRMED":
      return <Check className="h-4 w-4 text-green-600" />;
    default:
      return <Clock3 className="h-4 w-4 text-blue-600" />;
  }
}

function formatTimelineStatus(status: string) {
  switch (status) {
    case "CREATED":
      return "Booking Created";
    case "APPROVED":
      return "Booking Approved";
    case "PAYMENT_RECEIVED":
      return "Payment Received";
    case "CONFIRMED":
      return "Booking Confirmed";
    default:
      return status;
  }
}

function formatBoatCategory(category: string) {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
} 