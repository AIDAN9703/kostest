import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { bookings, externalGoogleCalendarSyncEvents, boats } from '@/database/schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const boatId = searchParams.get('boatId'); // Optional boat filter

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Build where conditions
    const bookingWhere = [
      gte(bookings.startDateTime, startDate),
      lte(bookings.startDateTime, endDate),
      inArray(bookings.bookingStatus, ['CONFIRMED', 'APPROVED', 'PENDING'])
    ];
    
    const externalWhere = [
      gte(externalGoogleCalendarSyncEvents.startTime, startDate),
      lte(externalGoogleCalendarSyncEvents.startTime, endDate),
      eq(externalGoogleCalendarSyncEvents.isAvailable, false)
    ];

    // Add boat filter if specified
    if (boatId) {
      bookingWhere.push(eq(bookings.boatId, boatId));
      externalWhere.push(eq(externalGoogleCalendarSyncEvents.boatId, boatId));
    }

    // Get bookings in date range
    const bookingEvents = await db
      .select({
        id: bookings.id,
        title: bookings.customerName,
        start: bookings.startDateTime,
        end: bookings.endDateTime,
        status: bookings.bookingStatus,
        boatId: bookings.boatId,
        boatName: boats.name,
        customerEmail: bookings.customerEmail,
        numberOfPassengers: bookings.numberOfPassengers,
        totalAmount: bookings.totalAmount
      })
      .from(bookings)
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .where(and(...bookingWhere));

    // Get external calendar events in date range
    const externalEvents = await db
      .select({
        id: externalGoogleCalendarSyncEvents.id,
        eventId: externalGoogleCalendarSyncEvents.eventId,
        start: externalGoogleCalendarSyncEvents.startTime,
        end: externalGoogleCalendarSyncEvents.endTime,
        source: externalGoogleCalendarSyncEvents.source,
        boatId: externalGoogleCalendarSyncEvents.boatId,
        boatName: boats.name
      })
      .from(externalGoogleCalendarSyncEvents)
      .leftJoin(boats, eq(externalGoogleCalendarSyncEvents.boatId, boats.id))
      .where(and(...externalWhere));

    // Format events for FullCalendar
    const events = [
      // Booking events
      ...bookingEvents.map(booking => ({
        id: `booking-${booking.id}`,
        title: `${booking.title} (${booking.boatName})`,
        start: booking.start?.toISOString(),
        end: booking.end?.toISOString(),
        backgroundColor: getBookingColor(booking.status),
        borderColor: getBookingColor(booking.status),
        textColor: '#ffffff',
        extendedProps: {
          type: 'booking',
          bookingId: booking.id,
          customerName: booking.title,
          customerEmail: booking.customerEmail,
          boatName: booking.boatName,
          boatId: booking.boatId,
          numberOfPassengers: booking.numberOfPassengers,
          totalAmount: booking.totalAmount,
          bookingStatus: booking.status
        }
      })),
      
      // External calendar events
      ...externalEvents.map(external => ({
        id: `external-${external.id}`,
        title: `External Block (${external.boatName})`,
        start: external.start.toISOString(),
        end: external.end.toISOString(),
        backgroundColor: getExternalColor(external.source),
        borderColor: getExternalColor(external.source),
        textColor: '#ffffff',
        extendedProps: {
          type: 'external',
          source: external.source,
          boatName: external.boatName,
          boatId: external.boatId,
          eventId: external.eventId
        }
      }))
    ];

    return NextResponse.json(events);

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' }, 
      { status: 500 }
    );
  }
}

function getBookingColor(status: string) {
  switch (status) {
    case 'CONFIRMED':
    case 'APPROVED':
      return '#22c55e'; // Green
    case 'PENDING':
      return '#f59e0b'; // Amber
    case 'CANCELLED':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
}

function getExternalColor(source: string) {
  switch (source) {
    case 'GOOGLE':
      return '#06b6d4'; // Cyan for Google Calendar
    case 'MANUAL':
      return '#8b5cf6'; // Purple for manual blocks
    default:
      return '#64748b'; // Slate
  }
}