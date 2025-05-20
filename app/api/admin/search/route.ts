// Add dynamic configuration for Next.js 15
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/database/db';
import { users, boats, bookings } from '@/database/schema';
import { like, or, ilike, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Search across users
    const userResults = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        profileImage: users.profileImage,
        role: users.role,
      })
      .from(users)
      .where(
        or(
          ilike(users.firstName, `%${q}%`),
          ilike(users.lastName, `%${q}%`),
          ilike(users.email, `%${q}%`),
          ilike(users.username, `%${q}%`)
        )
      )
      .limit(5);

    // Search across boats
    const boatResults = await db
      .select({
        id: boats.id,
        name: boats.name,
        category: boats.category,
        mainImage: boats.mainImage,
        locationLabel: boats.locationLabel,
      })
      .from(boats)
      .where(
        or(
          ilike(boats.name, `%${q}%`),
          ilike(boats.make, `%${q}%`),
          ilike(boats.model, `%${q}%`),
          ilike(boats.locationLabel, `%${q}%`)
        )
      )
      .limit(5);

    // Search across bookings
    const bookingResults = await db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        status: bookings.bookingStatus,
        startDate: bookings.startDate,
      })
      .from(bookings)
      .where(
        or(
          ilike(bookings.customerName, `%${q}%`),
          ilike(bookings.customerEmail, `%${q}%`)
        )
      )
      .orderBy(desc(bookings.startDate))
      .limit(5);

    // Format results for the frontend
    const formattedResults = [
      // Format user results
      ...userResults.map(user => ({
        id: user.id.toString(),
        title: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unnamed User',
        subtitle: user.email,
        type: 'user' as const,
        url: `/admin/users/${user.id}`,
        image: user.profileImage || undefined,
      })),
      
      // Format boat results
      ...boatResults.map(boat => ({
        id: boat.id.toString(),
        title: boat.name,
        subtitle: `${boat.category}${boat.locationLabel ? ` · ${boat.locationLabel}` : ''}`,
        type: 'boat' as const,
        url: `/admin/boats/${boat.id}`,
        image: boat.mainImage || undefined,
      })),
      
      // Format booking results
      ...bookingResults.map(booking => ({
        id: booking.id.toString(),
        title: booking.customerName,
        subtitle: `${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'No date'} · ${booking.status}`,
        type: 'booking' as const,
        url: `/admin/bookings/${booking.id}`,
      })),
    ];

    // Limit to 10 total results
    return NextResponse.json({ 
      results: formattedResults.slice(0, 10)
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
} 