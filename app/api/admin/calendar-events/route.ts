import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { bookings, boats, bookingPricing, boatExternalCalendarEvents } from '@/database/schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
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

    const bookingWhere = [
      gte(bookings.startDateTime, startDate),
      lte(bookings.startDateTime, endDate),
      inArray(bookings.bookingStatus, ['CONFIRMED', 'APPROVED', 'PENDING'])
    ];

    if (boatId) {
      bookingWhere.push(eq(bookings.boatId, boatId));
    }

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
        totalAmountCents: bookingPricing.totalAmountCents
      })
      .from(bookings)
      .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .where(and(...bookingWhere));

    // Imported external (iCal) calendar busy blocks — shown as muted, read-only.
    const externalWhere = [
      gte(boatExternalCalendarEvents.startTime, startDate),
      lte(boatExternalCalendarEvents.startTime, endDate),
    ];
    if (boatId) {
      externalWhere.push(eq(boatExternalCalendarEvents.boatId, boatId));
    }

    const externalEvents = await db
      .select({
        id: boatExternalCalendarEvents.id,
        summary: boatExternalCalendarEvents.summary,
        start: boatExternalCalendarEvents.startTime,
        end: boatExternalCalendarEvents.endTime,
        boatId: boatExternalCalendarEvents.boatId,
      })
      .from(boatExternalCalendarEvents)
      .where(and(...externalWhere));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: any[] = bookingEvents.map(booking => ({
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
        totalAmountCents: booking.totalAmountCents ?? 0,
        bookingStatus: booking.status
      }
    }));

    for (const ext of externalEvents) {
      events.push({
        id: `external-${ext.id}`,
        title: ext.summary || 'External event',
        start: ext.start?.toISOString(),
        end: ext.end?.toISOString(),
        backgroundColor: '#6b7280', // Gray — external/imported
        borderColor: '#6b7280',
        textColor: '#ffffff',
        extendedProps: {
          type: 'external',
          boatId: ext.boatId,
        },
      });
    }

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
