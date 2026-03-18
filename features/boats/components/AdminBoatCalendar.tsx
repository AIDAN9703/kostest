"use client";

import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { BookingCalendarEvent } from "@/features/bookings/booking.types";
import { formatCurrency } from "@/shared/lib/utils/general-utils";

interface AdminBoatCalendarProps {
  boatId: string;
  boatName: string;
  timezone?: string;
}

export default function AdminBoatCalendar({
  boatId,
  boatName,
  timezone,
}: AdminBoatCalendarProps) {
  const [selectedEvent, setSelectedEvent] =
    useState<BookingCalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const calendarRef = useRef<FullCalendar>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const handleDateSelect = (selectInfo: any) => {
    // Handle date selection for creating new bookings
    console.log("Date selected:", selectInfo);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {boatName} Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={currentView === "dayGridMonth" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("dayGridMonth")}
                  className="text-xs"
                >
                  Month
                </Button>
                <Button
                  variant={currentView === "timeGridWeek" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("timeGridWeek")}
                  className="text-xs"
                >
                  Week
                </Button>
                <Button
                  variant={currentView === "listWeek" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("listWeek")}
                  className="text-xs"
                >
                  List
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (calendarRef.current) {
                    calendarRef.current.getApi().today();
                  }
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            timeZone={timezone || "local"}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "",
            }}
            initialView={currentView}
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={`/api/admin/calendar-events?boatId=${boatId}`}
            eventClick={handleEventClick}
            select={handleDateSelect}
            height="auto"
            eventDisplay="block"
            dayHeaderFormat={{ weekday: "short" }}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
          />
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.extendedProps.type === "booking" && (
                <div className="flex justify-center">
                  <Badge
                    style={{
                      backgroundColor: selectedEvent.backgroundColor,
                      color: selectedEvent.textColor,
                    }}
                    className="px-3 py-1"
                  >
                    {selectedEvent.extendedProps.bookingStatus}
                  </Badge>
                </div>
              )}

              {selectedEvent.extendedProps.type === "booking" && (
                <div>
                  <h3 className="font-medium text-gray-900">Customer</h3>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.extendedProps.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.extendedProps.customerEmail}
                  </p>
                  {selectedEvent.extendedProps.customerPhone && (
                    <p className="text-sm text-gray-600">
                      {selectedEvent.extendedProps.customerPhone}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Date & Time</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedEvent.start)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEvent.start).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {selectedEvent.end
                      ? ` - ${new Date(selectedEvent.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                      : ""}
                  </p>
                </div>
                {selectedEvent.extendedProps.type === "booking" && (
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Guests & Amount
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.extendedProps.numberOfPassengers} guests
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(selectedEvent.extendedProps.totalAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedEvent.extendedProps.type === "booking" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        `mailto:${selectedEvent.extendedProps.customerEmail}`,
                      )
                    }
                  >
                    Email Customer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        `/admin/bookings/${selectedEvent.extendedProps.bookingId}`,
                      )
                    }
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
