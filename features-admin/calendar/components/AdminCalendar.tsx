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
import { Calendar, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import Link from "next/link";
import { useToast } from "@/shared/hooks/use-toast";

export default function AdminCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [syncing, setSyncing] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState<string>('');
  const calendarRef = useRef<FullCalendar>(null);
  const { toast } = useToast();

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

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setIsModalOpen(true);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
  };

  const handleSyncCalendars = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/calendar-sync', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Sync failed');
      
      const result = await response.json();
      
      toast({
        title: "Sync Complete",
        description: `Synced ${result.totalCalendars} calendars (${result.successCount} successful)`
      });
      
      // Refresh calendar
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync external calendars",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Calendar */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {calendarTitle || 'Calendar'}
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} className="border-gray-200 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="border-gray-200 hover:bg-gray-50">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} className="border-gray-200 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm ml-2">
                <Button
                  variant={currentView === 'dayGridMonth' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange('dayGridMonth')}
                  className="text-xs"
                >
                  Month
                </Button>
                <Button
                  variant={currentView === 'timeGridWeek' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange('timeGridWeek')}
                  className="text-xs"
                >
                  Week
                </Button>
                <Button
                  variant={currentView === 'listWeek' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange('listWeek')}
                  className="text-xs"
                >
                  List
                </Button>
              </div>
              <Button 
                size="sm" 
                onClick={handleSyncCalendars}
                disabled={syncing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md ml-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              timeZone="local"
              headerToolbar={false}
              initialView={currentView}
              editable={false}
              selectable={false}
              dayMaxEvents={3}
              weekends={true}
              events="/api/admin/calendar-events"
              eventClick={handleEventClick}
              height="auto"
              eventDisplay="block"
              dayHeaderFormat={{ weekday: 'short' }}
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              businessHours={{
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '06:00',
                endTime: '20:00',
              }}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              slotDuration="00:30:00"
              datesSet={(arg) => setCalendarTitle(arg.view.title)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.extendedProps?.type === 'external' ? 'External Block' : 'Booking Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.extendedProps.type === 'booking' && (
                <div className="flex justify-center">
                  <Badge 
                    style={{ 
                      backgroundColor: selectedEvent.backgroundColor,
                      color: selectedEvent.textColor
                    }}
                    className="px-3 py-1"
                  >
                    {selectedEvent.extendedProps.bookingStatus}
                  </Badge>
                </div>
              )}

              {selectedEvent.extendedProps.type === 'booking' && (
                <div>
                  <h3 className="font-medium text-gray-900">Customer</h3>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.customerEmail}</p>
                  {selectedEvent.extendedProps.customerPhone && (
                    <p className="text-sm text-gray-600">{selectedEvent.extendedProps.customerPhone}</p>
                  )}
                </div>
              )}

              {/* Boat Info */}
              {selectedEvent.extendedProps.boatName && (
                <div>
                  <h3 className="font-medium text-gray-900">Boat</h3>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/boats/${selectedEvent.extendedProps.boatId}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedEvent.extendedProps.boatName}
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Date & Time</h3>
                  <p className="text-sm text-gray-600">{formatDate(selectedEvent.start)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEvent.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {selectedEvent.end ? ` - ${new Date(selectedEvent.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
                  </p>
                </div>
                {selectedEvent.extendedProps.type === 'booking' && (
                  <div>
                    <h3 className="font-medium text-gray-900">Guests & Amount</h3>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.extendedProps.numberOfPassengers} guests
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(selectedEvent.extendedProps.totalAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Special Requests */}
              {selectedEvent.extendedProps.type === 'booking' && selectedEvent.extendedProps.specialRequests && (
                <div>
                  <h3 className="font-medium text-gray-900">Special Requests</h3>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.specialRequests}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedEvent.extendedProps.type === 'booking' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(`mailto:${selectedEvent.extendedProps.customerEmail}`)}
                  >
                    Email Customer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(`/admin/bookings/${selectedEvent.extendedProps.bookingId}`)}
                  >
                    View Details
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 