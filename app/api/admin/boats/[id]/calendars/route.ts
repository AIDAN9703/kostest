import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { boatGoogleCalendars } from '@/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: boatId } = await params;

    // Fetch calendars for this boat
    const calendars = await db
      .select()
      .from(boatGoogleCalendars)
      .where(eq(boatGoogleCalendars.boatId, boatId));

    return NextResponse.json(calendars);

  } catch (error) {
    console.error('Error fetching boat calendars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendars' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: boatId } = await params;
    const { calendarName, calendarId, ownerType } = await request.json();

    // Validate input
    if (!calendarName || !calendarId || !ownerType) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Create new calendar
    const [newCalendar] = await db
      .insert(boatGoogleCalendars)
      .values({
        boatId,
        calendarName,
        calendarId,
        ownerType,
        ownerUserId: session.user.id,
        syncEnabled: true,
        lastSyncStatus: 'PENDING'
      })
      .returning();

    return NextResponse.json(newCalendar);

  } catch (error) {
    console.error('Error creating boat calendar:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar' }, 
      { status: 500 }
    );
  }
}
