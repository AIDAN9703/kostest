'use server'

import { db } from '@/database/db'
import { bookings, bookingPricing, users, boats, blogPosts } from '@/database/schema'
import { count, gte, sql, eq } from 'drizzle-orm'
import { cache } from 'react'
import { startOfDay, endOfDay, addDays } from 'date-fns'
import { bookingService } from '@/features/bookings/booking.service'
import { inquiryService } from '@/features/inquiries/inquiry.service'

/* Types */
import { BookingListItem } from '@/features/bookings/booking.types'
import { InquiryListItem } from '@/features/inquiries/inquiry.types'


export interface DashboardStats {
  totalUsers: number
  totalBoats: number
  bookingsThisMonth: number
  revenueThisMonthCents: number
}

export interface TopBlogPost {
  id: string
  title: string
  slug: string
  viewCount: number
  publishedAt: Date | null
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get start of current month
 */
function getStartOfMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// ============================================================================
// STATS
// ============================================================================

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const startOfMonth = getStartOfMonth()

  const [totalUsersResult, totalBoatsResult, currentMonthStats] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(boats),
    db
      .select({
        bookingsCount: count(bookings.id),
        revenueCents: sql<number>`COALESCE(SUM(${bookingPricing.totalAmountCents}), 0)`.as('revenue_cents'),
      })
      .from(bookings)
      .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
      .where(gte(bookings.createdAt, startOfMonth)),
  ])

  return {
    totalUsers: Number(totalUsersResult[0]?.count) || 0,
    totalBoats: Number(totalBoatsResult[0]?.count) || 0,
    bookingsThisMonth: Number(currentMonthStats[0]?.bookingsCount) || 0,
    revenueThisMonthCents: Number(currentMonthStats[0]?.revenueCents) || 0,
  }
})

// ============================================================================
// RECENT ITEMS
// ============================================================================

export const getRecentInquiries = cache(async (limit = 6): Promise<InquiryListItem[]> => {
  const result = await inquiryService.getAllInquiries({ limit })
  return result.inquiries as InquiryListItem[]
})

export const getTopBlogPosts = cache(async (limit = 5): Promise<TopBlogPost[]> => {
  const rows = await db.query.blogPosts.findMany({
    columns: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      publishedAt: true,
    },
    orderBy: (blogPosts, { desc }) => desc(blogPosts.viewCount),
    limit,
  })

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    viewCount: Number(row.viewCount ?? 0),
    publishedAt: row.publishedAt,
  }))
})

// ============================================================================
// BOOKINGS (Today / This Week)
// ============================================================================

export const getTodaysBookings = cache(async (): Promise<BookingListItem[]> => {
  const now = new Date()
  const dateFrom = startOfDay(now).toISOString()
  const dateTo = endOfDay(now).toISOString()
  const result = await bookingService.getAllBookings({
    dateFrom,
    dateTo,
    limit: 20,
  })
  return result.bookings
})

/** Next 7 days from today (today + 6 days) - no past bookings */
export const getWeeksBookings = cache(async (): Promise<BookingListItem[]> => {
  const now = new Date()
  const dateFrom = startOfDay(now).toISOString()
  const dateTo = endOfDay(addDays(now, 6)).toISOString()
  const result = await bookingService.getAllBookings({
    dateFrom,
    dateTo,
    limit: 20,
  })
  return result.bookings
})
