"use client";

import { CalendarCheck, MoreHorizontal, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate, formatTime12Hour } from "@/lib/utils/general-utils";
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
import { FieldDropdown } from "@/components/admin/common/FieldDropdown";

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



export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 bg-gray-50/70">
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[8%]">ID</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Customer</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Boat</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[15%]">Dates</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[12%]">Status</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[12%]">Amount</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[12%]">Payment</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium text-right w-[8%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-3 py-6 text-center text-gray-500">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-3 py-2">
                    <span className="font-mono text-xs text-gray-600">
                      {booking.id.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {booking.userProfileImage ? (
                          <Image
                            src={booking.userProfileImage}
                            alt={booking.customerName}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-xs font-medium">
                            {booking.customerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate">{booking.customerName}</div>
                        <div className="text-xs text-gray-500 truncate">{booking.customerEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {booking.boatMainImage ? (
                          <Image
                            src={booking.boatMainImage}
                            alt={booking.boatName || "Boat"}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-blue-50">
                            <CalendarCheck className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate">{booking.boatName || "Unknown Boat"}</div>
                        <div className="text-xs text-gray-500 capitalize truncate">
                          {booking.boatCategory?.toLowerCase().replace('_', ' ') || 'No category'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">{formatDate(booking.startDate)}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime12Hour(booking.startTime)} - {formatTime12Hour(booking.endTime)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <FieldDropdown
                      entity="booking"
                      id={booking.id}
                      field="bookingStatus"
                      currentValue={booking.bookingStatus}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="font-medium text-gray-900 text-sm">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.numberOfPassengers} guest{booking.numberOfPassengers !== 1 ? 's' : ''}
                      {booking.needsCaptain && <span className="ml-1">• Captain</span>}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <FieldDropdown
                      entity="booking"
                      id={booking.id}
                      field="paymentStatus"
                      currentValue={booking.paymentStatus || "PENDING"}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/bookings/${booking.id}`} className="cursor-pointer flex items-center">
                            <CalendarCheck className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Contact Customer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
  );
} 