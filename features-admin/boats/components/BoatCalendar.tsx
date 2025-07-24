"use client";

import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

interface BoatCalendarProps {
  boatId: string;
  boatName: string;
}

interface BookingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bookingStatus: string;
    bookingType: string;
    numberOfPassengers: number;
    totalAmount: number;
    specialRequests: string;
    startTime: string;
    endTime: string;
    createdAt: string;
  };
}

export default function BoatCalendar({ boatId, boatName }: BoatCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const calendarRef = useRef<FullCalendar>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'CONFIRMED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'COMPLETED': 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setIsModalOpen(true);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  const goToToday = () => {
    calendarRef.current?.getApi().today();
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const api = calendarRef.current?.getApi();
    if (direction === 'prev') {
      api?.prev();
    } else {
      api?.next();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {boatName} - Booking Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Navigation Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCalendar('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                <RotateCcw className="h-4 w-4" />
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCalendar('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* View Selector */}
              <div className="flex border rounded-md">
                <Button
                  variant={currentView === 'dayGridMonth' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => handleViewChange('dayGridMonth')}
                >
                  Month
                </Button>
                <Button
                  variant={currentView === 'timeGridWeek' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => handleViewChange('timeGridWeek')}
                >
                  Week
                </Button>
                <Button
                  variant={currentView === 'listWeek' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => handleViewChange('listWeek')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
          
          {/* Status Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Cancelled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Completed</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false} // We're using custom header
            height="auto"
            aspectRatio={1.8}
            events={`/api/admin/boats/${boatId}/calendar-events`}
            eventClick={handleEventClick}
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkClick="popover"
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
              startTime: '06:00',
              endTime: '20:00',
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Customer</h3>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.customerEmail}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.customerPhone}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  {getStatusBadge(selectedEvent.extendedProps.bookingStatus)}
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Date & Time</h3>
                  <p className="text-sm text-gray-600">{formatDate(selectedEvent.start)}</p>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.extendedProps.startTime} - {selectedEvent.extendedProps.endTime}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Guests & Amount</h3>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.extendedProps.numberOfPassengers} guests
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(selectedEvent.extendedProps.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              {selectedEvent.extendedProps.specialRequests && (
                <div>
                  <h3 className="font-medium text-gray-900">Special Requests</h3>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.extendedProps.specialRequests}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <a href={`/admin/bookings/${selectedEvent.id}`}>
                    View Full Details
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 