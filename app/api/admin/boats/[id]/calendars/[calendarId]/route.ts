import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { boatGoogleCalendars } from '@/database/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; calendarId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: boatId, calendarId } = await params;

    // Ensure the calendar exists and belongs to the specified boat
    const [calendar] = await db
      .select()
      .from(boatGoogleCalendars)
      .where(and(eq(boatGoogleCalendars.id, calendarId), eq(boatGoogleCalendars.boatId, boatId)))
      .limit(1);

    if (!calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
    }

    // Delete the calendar; external events cascade via FK
    await db
      .delete(boatGoogleCalendars)
      .where(eq(boatGoogleCalendars.id, calendarId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting boat calendar:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar' },
      { status: 500 }
    );
  }
}


