import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { icalSyncService } from '@/shared/lib/services/ical-sync.service';

export async function POST(request: NextRequest) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const boatCalendarId = searchParams.get('boatCalendarId');

    if (boatCalendarId) {
      // Sync specific boat calendar
      const result = await icalSyncService.syncBoatCalendar(boatCalendarId);
      return NextResponse.json(result);
    } else {
      // Sync all boat calendars
      const result = await icalSyncService.syncAllBoatCalendars();
      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Error syncing calendars:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendars' }, 
      { status: 500 }
    );
  }
}
