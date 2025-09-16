import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { boats } from '@/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Fetch boat by ID
    const boatData = await db
      .select({
        id: boats.id,
        name: boats.name,
        displayTitle: boats.displayTitle,
        active: boats.active,
        timezone: boats.timezone
      })
      .from(boats)
      .where(eq(boats.id, id))
      .limit(1);

    if (!boatData.length) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 });
    }

    return NextResponse.json(boatData[0]);

  } catch (error) {
    console.error('Error fetching boat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boat' }, 
      { status: 500 }
    );
  }
}
