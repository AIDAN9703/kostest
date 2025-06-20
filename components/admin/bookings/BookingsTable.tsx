"use client";

import { useState } from "react";
import { CalendarCheck, Check, Clock3, CreditCard, MoreHorizontal, Phone, Mail, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate, formatTime12Hour } from "@/lib/utils/general-utils";
import { cn } from "@/lib/utils/general-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Type for booking with joined data
type BookingWithDetails = {
  id: string;
  bookingType: string;
  bookingStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: Date | null;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  numberOfPassengers: number;
  totalAmount: number;
  paymentStatus: string | null;
  paymentMethod: string | null;
  needsCaptain: boolean | null;
  specialRequests: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Boat information
  boatId: string;
  boatName: string | null;
  boatCategory: string | null;
  boatMainImage: string | null;
  
  // User information (if booking has userId)
  userId: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userProfileImage: string | null;
};

interface BookingsTableProps {
  bookings: BookingWithDetails[];
}

// Status Badge Components
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    CONFIRMED: { 
      className: "bg-green-100 text-green-800 hover:bg-green-100",
      icon: Check,
      label: "Confirmed"
    },
    PENDING: { 
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      icon: Clock3,
      label: "Pending"
    },
    AWAITING_PAYMENT: { 
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      icon: CreditCard,
      label: "Awaiting Payment"
    },
    APPROVED: { 
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      icon: Check,
      label: "Approved"
    },
    CANCELLED: { 
      className: "bg-red-100 text-red-800 hover:bg-red-100",
      icon: X,
      label: "Cancelled"
    },
    COMPLETED: { 
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      icon: Check,
      label: "Completed"
    },
    DENIED: { 
      className: "bg-red-100 text-red-800 hover:bg-red-100",
      icon: X,
      label: "Denied"
    },
    EXPIRED: { 
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      icon: Clock3,
      label: "Expired"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: Clock3,
    label: status
  };

  const IconComponent = config.icon;

  return (
    <Badge className={config.className}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: string | null }) {
  const statusConfig = {
    PAID: { 
      className: "bg-green-100 text-green-800 hover:bg-green-100",
      icon: Check,
      label: "Paid"
    },
    PENDING: { 
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      icon: Clock3,
      label: "Pending"
    },
    FAILED: { 
      className: "bg-red-100 text-red-800 hover:bg-red-100",
      icon: X,
      label: "Failed"
    },
    REFUNDED: { 
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      icon: CreditCard,
      label: "Refunded"
    }
  };

  if (!status) {
    return (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        <Clock3 className="h-3 w-3 mr-1" />
        N/A
      </Badge>
    );
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: Clock3,
    label: status
  };

  const IconComponent = config.icon;

  return (
    <Badge className={config.className}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 bg-gray-50 border-b">
        <CardTitle className="text-lg">All Bookings</CardTitle>
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
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    <span className="font-mono text-xs">
                      {booking.id.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {booking.userProfileImage ? (
                          <Image
                            src={booking.userProfileImage}
                            alt={booking.customerName}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {booking.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {booking.boatMainImage && (
                        <div className="w-10 h-8 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={booking.boatMainImage}
                            alt={booking.boatName || "Boat"}
                            width={40}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{booking.boatName || "Unknown Boat"}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {booking.boatCategory?.toLowerCase().replace('_', ' ') || ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="h-3 w-3 text-gray-500" />
                      <div className="text-sm">
                        <div>{formatDate(booking.startDate)}</div>
                        <div className="text-xs text-gray-500">
                          {formatTime12Hour(booking.startTime)} - {formatTime12Hour(booking.endTime)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.bookingStatus} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.numberOfPassengers} guest{booking.numberOfPassengers !== 1 ? 's' : ''}
                      {booking.needsCaptain && <span className="ml-2">• Captain</span>}
                    </div>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/bookings/${booking.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 