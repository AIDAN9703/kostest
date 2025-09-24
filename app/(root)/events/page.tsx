"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ship, Users, Clock, ArrowRight, Ticket } from "lucide-react";
import { formatEventDate, formatEventTime, getLowestTicketPrice, getAvailableTicketsCount, getEventStatus, handleEventError } from "@/shared/utils/event-utils";
import { EventsGridSkeleton } from "@/shared/components/ui/event-loading";
import { EmptyState } from "@/shared/components/ui/empty-state";
import type { EventWithTiers } from "@/database/schema/tables/events/events.relations";

async function getActiveEvent(): Promise<EventWithTiers | null> {
  try {
    const response = await fetch(`/api/events/active`, {
      cache: 'no-store', // Always get fresh data
    });
    const data = await response.json();
    // Return the first active event since we only show one
    return data.success && data.events.length > 0 ? data.events[0] : null;
  } catch (error) {
    handleEventError(error, 'fetching event', false); // Don't show alert, handle gracefully
    return null;
  }
}

// Countdown Timer Component
function CountdownTimer({ eventDate }: { eventDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const eventTime = new Date(eventDate).getTime();
      const difference = eventTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
      ].map((item, index) => (
        <div key={item.label} className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-3 border border-white/20">
            <div className="text-xl lg:text-2xl font-bold text-white">
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-white/70 font-medium uppercase tracking-wide">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Featured Event Component
function FeaturedEvent({ event }: { event: EventWithTiers }) {
  const lowestPrice = getLowestTicketPrice(event.ticketTiers);
  const { status, availableTickets, isBookable } = getEventStatus(event);
  const totalSold = event.totalCapacity - availableTickets;

  // Get event image based on type
  const getEventImage = () => {
    if (event.title.toLowerCase().includes('sunset')) return '/images/experiences/sunset.jpg';
    if (event.title.toLowerCase().includes('corporate')) return '/images/experiences/corporateevents.webp';
    if (event.title.toLowerCase().includes('bachelor')) return '/images/experiences/bachellorette2.png';
    return '/images/partyflyer.jpg'; // Default
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">

      {/* Split Screen Layout */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Event Flyer */}
        <div className="lg:w-1/2 w-full min-h-[50vh] lg:min-h-screen bg-gray-200 flex items-center justify-center p-6 lg:p-8">
          {/* Paper Flyer Effect - Using aspect ratio for better scaling */}
          <div className="relative w-full max-w-sm lg:max-w-md aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Flyer Image */}
            <Image
              src={getEventImage()}
              alt={event.title}
              fill
              className="object-cover"
              priority
              quality={90}
            />
            {/* Subtle overlay to maintain flyer look */}
            <div className="absolute inset-0 bg-black/5" />
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="lg:w-1/2 w-full flex flex-col justify-center px-6 lg:px-8 xl:px-12 py-8 lg:py-12 bg-primary text-white">
          <div className="max-w-lg mx-auto lg:mx-0 w-full space-y-6">
            
            {/* Header Section */}
            <div className="space-y-3">
              <div className="inline-block">
                <span className="bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {formatEventDate(event.eventDate)}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-base leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Event Details Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <h3 className="text-base font-semibold mb-3">Event Details</h3>
              <div className="space-y-2.5">
                {event.startTime && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-3 text-gray-500 shrink-0" />
                    <span>
                      {formatEventTime(event.startTime)}
                      {event.endTime && ` - ${formatEventTime(event.endTime)}`}
                    </span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-gray-500 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                {event.yachtName && (
                  <div className="flex items-center text-sm">
                    <Ship className="h-4 w-4 mr-3 text-gray-500 shrink-0" />
                    <span className="truncate">{event.yachtName}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-3 text-gray-500 shrink-0" />
                  <span>{event.totalCapacity} Capacity</span>
                </div>
                <div className="flex items-center text-sm">
                  <Ticket className="h-4 w-4 mr-3 text-gray-500 shrink-0" />
                  <span>{event.ticketTiers.length} Ticket Types</span>
                </div>
              </div>
            </div>

            {/* Countdown Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <h3 className="text-base font-semibold mb-3">Event Starts In</h3>
              <CountdownTimer eventDate={new Date(event.eventDate)} />
            </div>

            {/* Pricing & Booking Section */}
            <div className="space-y-4">
              {lowestPrice && (
                <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-2">
                  <div>
                <span className="text-2xl font-bold">From ${lowestPrice}</span>
                    <span className="ml-2 text-sm">per ticket</span>
                  </div>
                  <div className="text-left lg:text-right text-sm">
                    <div>{availableTickets} available of {event.totalCapacity} total</div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {isBookable ? (
                <Link
                  href={`/events/${event.slug}`}
                  className="w-full bg-gold hover:bg-gold/90 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  Book Your Tickets
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-600 text-gray-300 px-8 py-3.5 rounded-xl font-semibold text-base cursor-not-allowed flex items-center justify-center"
                >
                  {status === 'passed' ? 'Event Has Passed' : 'Sold Out'}
                </button>
              )}

              {/* Additional Info */}
              <div className="text-center text-xs">
                <p>Secure checkout • Instant confirmation • Mobile tickets</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


function EventContent() {
  const [event, setEvent] = useState<EventWithTiers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const activeEvent = await getActiveEvent();
        setEvent(activeEvent);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Ship className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Events</h1>
          <p className="text-gray-600 mb-8">
            We don't have any active events at the moment. Check back soon for exciting boat party experiences!
          </p>
          <Link
            href="/"
            className="inline-flex items-center bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return <FeaturedEvent event={event} />;
}

export default function EventsPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading event...</p>
          </div>
        </div>
      }
    >
      <EventContent />
    </Suspense>
  );
}
