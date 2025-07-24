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
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, Ship } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import Link from "next/link";

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
    boatId: string;
    boatName: string;
  };
}

export default function AdminCalendar() {
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
              All Bookings Calendar
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
            events="/api/admin/calendar-events"
            eventClick={handleEventClick}
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkClick="popover"
            nowIndicator={true}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: 'short'
            }}
          />
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="grid gap-6">
              {/* Customer Info */}
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Customer Information</h3>
                  {getStatusBadge(selectedEvent.extendedProps.bookingStatus)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Name</p>
                    <p>{selectedEvent.extendedProps.customerName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Email</p>
                    <p>{selectedEvent.extendedProps.customerEmail}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Phone</p>
                    <p>{selectedEvent.extendedProps.customerPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Booking Type</p>
                    <p className="capitalize">{selectedEvent.extendedProps.bookingType || 'Standard'}</p>
                  </div>
                </div>
              </div>

              {/* Boat Info */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Boat Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Boat</p>
                    <Link 
                      href={`/admin/boats/${selectedEvent.extendedProps.boatId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedEvent.extendedProps.boatName}
                    </Link>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Passengers</p>
                    <p>{selectedEvent.extendedProps.numberOfPassengers || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Date</p>
                    <p>{formatDate(selectedEvent.start)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Time</p>
                    <p>{selectedEvent.extendedProps.startTime} - {selectedEvent.extendedProps.endTime}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Total Amount</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(selectedEvent.extendedProps.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Booking ID</p>
                    <p className="font-mono text-xs">{selectedEvent.id}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedEvent.extendedProps.specialRequests && (
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold">Special Requests</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {selectedEvent.extendedProps.specialRequests}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button asChild variant="outline">
                  <Link href={`/admin/bookings/${selectedEvent.id}`}>
                    View Full Details
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/admin/boats/${selectedEvent.extendedProps.boatId}`}>
                    View Boat
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 