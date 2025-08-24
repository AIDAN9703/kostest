import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { bookings, boats } from '@/database/schema';
import { gte, lte, and, eq } from 'drizzle-orm';
import { parseISODateTimeInBoatTimezone } from '@/shared/utils/booking-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Get date range from query params (FullCalendar sends these)
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Build date filter based on startDateTime
    let dateFilter;
    if (start && end) {
      dateFilter = and(
        gte(bookings.startDateTime, new Date(start)),
        lte(bookings.startDateTime, new Date(end))
      );
    }

    // Get all bookings with boat information
    const allBookings = await db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        startDateTime: bookings.startDateTime,
        endDateTime: bookings.endDateTime,
        bookingStatus: bookings.bookingStatus,
        bookingType: bookings.bookingType,
        numberOfPassengers: bookings.numberOfPassengers,
        totalAmount: bookings.totalAmount,
        specialRequests: bookings.specialRequests,
        createdAt: bookings.createdAt,
        boatId: bookings.boatId,
        boatName: boats.name,
      })
      .from(bookings)
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .where(dateFilter)
      .orderBy(bookings.startDateTime);

    // Convert to FullCalendar event format
    const events = allBookings.map(booking => {
      // Use the datetime fields directly (they're already Date objects in UTC)
      const startDateTime = booking.startDateTime;
      const endDateTime = booking.endDateTime || booking.startDateTime;
      
      // Parse times for display in extendedProps (converted to user's local timezone)
      const { time: startTime } = parseISODateTimeInBoatTimezone(startDateTime?.toISOString() || "");
      const { time: endTime } = parseISODateTimeInBoatTimezone(endDateTime?.toISOString() || "");
      
      // Color coding based on booking status
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'CONFIRMED': return '#22c55e'; // Green
          case 'PENDING': return '#f59e0b';   // Yellow
          case 'CANCELLED': return '#ef4444'; // Red
          case 'COMPLETED': return '#06b6d4'; // Cyan
          default: return '#6b7280';          // Gray
        }
      };

      const getBorderColor = (status: string) => {
        switch (status) {
          case 'CONFIRMED': return '#16a34a';
          case 'PENDING': return '#d97706';
          case 'CANCELLED': return '#dc2626';
          case 'COMPLETED': return '#0891b2';
          default: return '#4b5563';
        }
      };

      const getTextColor = (status: string) => {
        return status === 'PENDING' ? '#92400e' : '#ffffff';
      };

      return {
        id: booking.id,
        title: `${booking.customerName} - ${booking.boatName || 'Unknown Boat'} (${booking.numberOfPassengers || 'N/A'} guests)`,
        start: startDateTime?.toISOString(),
        end: endDateTime?.toISOString(),
        backgroundColor: getStatusColor(booking.bookingStatus),
        borderColor: getBorderColor(booking.bookingStatus),
        textColor: getTextColor(booking.bookingStatus),
        extendedProps: {
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          bookingStatus: booking.bookingStatus,
          bookingType: booking.bookingType,
          numberOfPassengers: booking.numberOfPassengers,
          totalAmount: booking.totalAmount,
          specialRequests: booking.specialRequests,
          startTime: startTime, // Local timezone for display
          endTime: endTime,     // Local timezone for display
          createdAt: booking.createdAt,
          boatId: booking.boatId,
          boatName: booking.boatName,
        }
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to get calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to get calendar events' },
      { status: 500 }
    );
  }
} 