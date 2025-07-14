'use server';

import { db } from "@/database/db";
import { reviews, users } from "@/database/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";

export interface ReviewWithUser {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean | null;
  isFeatured: boolean | null;
  helpfulCount: number | null;
  createdAt: Date;
  // Reviewer information
  reviewerName: string | null;
  reviewerFirstName: string | null;
  reviewerDisplayName: string | null;
}

/**
 * Get reviews for a boat with reviewer information
 */
export const getBoatReviews = cache(async (boatId: string, limit = 10): Promise<ReviewWithUser[]> => {
  try {
    const reviewsWithUsers = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        isVerified: reviews.isVerified,
        isFeatured: reviews.isFeatured,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        // Reviewer information
        reviewerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        reviewerFirstName: users.firstName,
        reviewerDisplayName: users.displayName,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.reviewerId, users.id))
      .where(
        and(
          eq(reviews.reviewedBoatId, boatId),
          eq(reviews.type, 'BOAT'),
          eq(reviews.status, 'PUBLISHED')
        )
      )
      .orderBy(desc(reviews.isFeatured), desc(reviews.createdAt))
      .limit(limit);

    return reviewsWithUsers;
  } catch (error) {
    console.error(`Error fetching reviews for boat ${boatId}:`, error);
    return [];
  }
}); 