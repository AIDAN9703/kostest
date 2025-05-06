import { Metadata } from "next";
import { CalendarCheck, Check, Clock3, CreditCard, Filter, MoreHorizontal, Search, SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/general-utils";

export const metadata: Metadata = {
  title: "Bookings | Admin Dashboard",
  description: "Manage all bookings on the platform",
};

// Mock data
const bookings = [
  {
    id: "B12345",
    customer: {
      name: "John Smith",
      email: "john@example.com",
      avatar: "/avatars/01.png",
    },
    boat: {
      name: "Ocean Explorer",
      id: "boat-123",
    },
    startDate: "2023-08-15",
    endDate: "2023-08-16",
    status: "CONFIRMED",
    totalAmount: 1250,
    paymentStatus: "PAID",
    createdAt: "2023-08-01T10:30:00Z",
  },
  {
    id: "B12346",
    customer: {
      name: "Jane Cooper",
      email: "jane@example.com",
      avatar: "/avatars/02.png",
    },
    boat: {
      name: "Royal Voyager",
      id: "boat-124",
    },
    startDate: "2023-08-18",
    endDate: "2023-08-19",
    status: "PENDING",
    totalAmount: 1850,
    paymentStatus: "PENDING",
    createdAt: "2023-08-02T14:20:00Z",
  },
  {
    id: "B12347",
    customer: {
      name: "Michael Johnson",
      email: "michael@example.com",
      avatar: "/avatars/03.png",
    },
    boat: {
      name: "Paradise Cruiser",
      id: "boat-125",
    },
    startDate: "2023-08-20",
    endDate: "2023-08-22",
    status: "COMPLETED",
    totalAmount: 3200,
    paymentStatus: "PAID",
    createdAt: "2023-08-05T09:45:00Z",
  },
  {
    id: "B12348",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/avatars/04.png",
    },
    boat: {
      name: "Coastal Dream",
      id: "boat-126",
    },
    startDate: "2023-08-25",
    endDate: "2023-08-26",
    status: "CANCELLED",
    totalAmount: 1500,
    paymentStatus: "REFUNDED",
    createdAt: "2023-08-10T16:15:00Z",
  },
  {
    id: "B12349",
    customer: {
      name: "Robert Wilson",
      email: "robert@example.com",
      avatar: "/avatars/05.png",
    },
    boat: {
      name: "Sea Breeze",
      id: "boat-127",
    },
    startDate: "2023-09-01",
    endDate: "2023-09-02",
    status: "CONFIRMED",
    totalAmount: 2100,
    paymentStatus: "PAID",
    createdAt: "2023-08-15T11:30:00Z",
  },
];

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <Button className="hidden sm:flex">
          Export Report
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">All Bookings</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input 
                  placeholder="Search bookings..." 
                  className="w-full sm:w-[200px] pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">View options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Confirmed Bookings</DropdownMenuItem>
                  <DropdownMenuItem>Pending Bookings</DropdownMenuItem>
                  <DropdownMenuItem>Cancelled Bookings</DropdownMenuItem>
                  <DropdownMenuItem>Completed Bookings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>This Month</DropdownMenuItem>
                  <DropdownMenuItem>Last Month</DropdownMenuItem>
                  <DropdownMenuItem>Custom Range...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Boat</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="font-medium">{booking.customer.name}</div>
                        <div className="text-xs text-gray-500">{booking.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.boat.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="h-3 w-3 text-gray-500" />
                      <span className="text-sm">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    {formatCurrency(booking.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing <strong>5</strong> of <strong>42</strong> bookings
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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