"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/general-utils";
import { Badge } from "@/shared/components/ui/badge";

interface CalendarViewProps {
  filters: {
    search: string;
    status: string;
    type: string;
    dateFrom: string;
    dateTo: string;
    boat: string;
    customer: string;
  };
  bookingsData?: {
    bookings: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}


export function CalendarView({ filters, bookingsData }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Convert real bookings to calendar format
  const calendarBookings = bookingsData?.bookings?.map(booking => ({
    id: booking.id,
    date: booking.startDateTime ? new Date(booking.startDateTime).toISOString().split('T')[0] : '',
    customerName: booking.customerName || 'Unknown',
    boatName: booking.boatName || 'Unknown Boat',
    status: booking.bookingStatus?.toLowerCase() || 'pending',
    type: booking.bookingType?.toLowerCase() || 'request'
  })).filter(booking => booking.date) || [];

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // Generate calendar days
  const calendarDays = [];
  const currentDay = new Date(startDate);
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarBookings.filter(booking => booking.date === dateString);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'inquiry': return 'bg-blue-500';
      case 'completed': return 'bg-gray-400';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="p-6">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const bookings = getBookingsForDate(date);
          const dateString = date.toISOString().split('T')[0];
          
          return (
            <div
              key={index}
              className={cn(
                "aspect-square p-2 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors",
                !isCurrentMonth(date) && "text-gray-400 bg-gray-50/50",
                isToday(date) && "border-blue-500 bg-blue-50",
                selectedDate === dateString && "bg-blue-100 border-blue-600"
              )}
              onClick={() => setSelectedDate(selectedDate === dateString ? null : dateString)}
            >
              <div className="h-full flex flex-col">
                {/* Date number */}
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday(date) && "text-blue-600",
                  !isCurrentMonth(date) && "text-gray-400"
                )}>
                  {date.getDate()}
                </div>
                
                {/* Booking indicators */}
                <div className="flex-1 space-y-1">
                  {bookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        "h-1.5 rounded-full",
                        getStatusColor(booking.status)
                      )}
                      title={`${booking.customerName} - ${booking.boatName} (${booking.status})`}
                    />
                  ))}
                  {bookings.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{bookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-4">
            Bookings for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </h4>
          
          {(() => {
            const dayBookings = getBookingsForDate(new Date(selectedDate));
            
            if (dayBookings.length === 0) {
              return (
                <p className="text-gray-500 text-sm">No bookings scheduled for this date.</p>
              );
            }

            return (
              <div className="space-y-3">
                {dayBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", getStatusColor(booking.status))}></div>
                      <div>
                        <div className="font-medium text-gray-900">{booking.customerName}</div>
                        <div className="text-sm text-gray-600">{booking.boatName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {booking.type}
                      </Badge>
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}