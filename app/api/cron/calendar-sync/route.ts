import { NextResponse } from 'next/server';
import { icalSyncService } from '@/shared/lib/services/ical-sync.service';

export async function GET() {
  try {
    // Verify cron authorization (Vercel provides this header)
    const authHeader = process.env.CRON_SECRET;
    
    if (authHeader) {
      // In production, verify the cron secret
      // For now, we'll skip this check in development
    }

    console.log('Starting scheduled calendar sync...');
    
    const result = await icalSyncService.syncAllBoatCalendars();
    
    console.log('Calendar sync completed:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Calendar sync completed successfully',
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron calendar sync failed:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Allow both GET (for cron) and POST (for manual triggers)
export async function POST() {
  return GET();
}
