import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityService } from '@/features/availability/services/availability.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: boatId } = await params;
    const { searchParams } = new URL(request.url);
    
    const monthParam = searchParams.get('month'); // Format: YYYY-MM
    
    if (!monthParam) {
      return NextResponse.json({ error: 'Missing month parameter' }, { status: 400 });
    }

    // Parse month parameter (YYYY-MM format)
    const [year, month] = monthParam.split('-').map(Number);
    const monthDate = new Date(year, month - 1, 1); // month is 0-indexed
    
    const availabilityService = new AvailabilityService();
    const calendarDays = await availabilityService.getMonthAvailability(boatId, monthDate);

    return NextResponse.json({ 
      month: monthParam,
      days: calendarDays.map(day => ({
        date: day.date.toISOString(),
        status: day.status,
        conflictCount: day.conflictCount
      }))
    });
  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar availability' }, 
      { status: 500 }
    );
  }
} 