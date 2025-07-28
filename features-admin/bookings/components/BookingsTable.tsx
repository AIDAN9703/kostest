"use client";

import { CalendarCheck, MoreHorizontal, Mail, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate, formatTime12Hour } from "@/shared/utils/general-utils";
import { parseISODateTime } from "@/shared/utils/booking-utils";
import { format } from "date-fns";
import { DatabaseBooking } from "@/shared/types/booking.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { FieldDropdown } from "@/features-admin/_shared/FieldDropdown";
import { DeleteBookingButton } from "@/features-admin/bookings/components/DeleteBookingButton";

interface BookingsTableProps {
  bookings: DatabaseBooking[];
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
              bookings.map((booking) => {
                // Parse UTC datetime from database and convert to user's local timezone
                const { date: startDate, time: startTime } = parseISODateTime(booking.startDateTime?.toISOString() || "");
                const { time: endTime } = parseISODateTime(booking.endDateTime?.toISOString() || "");
                
                return (
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
                          {booking.customerPhone && (
                            <div className="text-xs text-gray-400 truncate">{booking.customerPhone}</div>
                          )}
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
                        <div className="text-gray-900 font-medium">
                          {startDate ? format(startDate, 'MMM d, yyyy') : 'No date'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {startTime ? formatTime12Hour(startTime) : 'No time'} - {endTime ? formatTime12Hour(endTime) : 'No time'}
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
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/bookings/${booking.id}`} className="text-gray-500 hover:text-primary" title="View Details">
                          <CalendarCheck className="h-5 w-5" />
                        </Link>
                        <a href={`mailto:${booking.customerEmail}`} className="text-gray-500 hover:text-primary" title="Contact Customer">
                          <Mail className="h-5 w-5" />
                        </a>
                        <DeleteBookingButton bookingId={booking.id} customerName={booking.customerName} iconOnly />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
  );
} 