import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { bookings, boats } from '@/database/schema';
import { gte, lte, and, eq } from 'drizzle-orm';

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

    // Build date filter
    let dateFilter;
    if (start && end) {
      dateFilter = and(
        gte(bookings.startDate, new Date(start)),
        lte(bookings.startDate, new Date(end))
      );
    }

    // Get all bookings with boat information
    const allBookings = await db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
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
      .orderBy(bookings.startDate);

    // Convert to FullCalendar event format
    const events = allBookings.map(booking => {
      const startDateTime = combineDateTime(booking.startDate, booking.startTime);
      const endDateTime = combineDateTime(booking.endDate || booking.startDate, booking.endTime);
      
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
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
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
          startTime: booking.startTime,
          endTime: booking.endTime,
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

function combineDateTime(date: Date, time: string): Date {
  const combined = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    combined.setHours(hours, minutes, 0, 0);
  }
  return combined;
} 