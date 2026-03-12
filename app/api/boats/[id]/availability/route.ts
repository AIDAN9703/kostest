import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityService } from '@/features/availability/services/availability.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: boatId } = await params;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const excludeBookingId = searchParams.get('excludeBookingId');
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing date range' }, { status: 400 });
    }

    const availabilityService = new AvailabilityService();
    const availability = await availabilityService.checkTimeSlotAvailability(
      boatId,
      new Date(startDate),
      new Date(endDate),
      excludeBookingId || undefined
    );

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' }, 
      { status: 500 }
    );
  }
} 