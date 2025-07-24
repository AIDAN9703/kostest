import { db } from './db';
import { boats, reviews } from './schema';
import { eq, and, sql } from 'drizzle-orm';

export async function calculateAndUpdateReviewStats() {
  console.log("📊 Starting review statistics calculation...");
  
  try {
    // Get all boats with their review statistics in one query
    const boatStats = await db
      .select({
        boatId: reviews.reviewedBoatId,
        averageRating: sql<number>`ROUND(AVG(${reviews.rating}), 1)`,
        totalReviews: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.type, 'BOAT'),
          eq(reviews.status, 'PUBLISHED')
        )
      )
      .groupBy(reviews.reviewedBoatId);

    console.log(`📋 Found review statistics for ${boatStats.length} boats`);

    // Reset all boats to null/0 first (for boats with no reviews)
    console.log("🔄 Resetting all boat review statistics...");
    await db
      .update(boats)
      .set({
        averageRating: null,
        totalReviews: 0
      });

    let updatedCount = 0;

    // Update each boat with its calculated statistics
    for (const stat of boatStats) {
      if (stat.boatId) {
        await db
          .update(boats)
          .set({
            averageRating: stat.averageRating,
            totalReviews: stat.totalReviews
          })
          .where(eq(boats.id, stat.boatId));
        
        updatedCount++;
        
        console.log(`⭐ Updated boat ${stat.boatId}: ${stat.averageRating}★ (${stat.totalReviews} reviews)`);
      }
    }

    console.log("\n✅ Review statistics calculation completed!");
    console.log(`📊 Statistics:`);
    console.log(`   • Boats with reviews: ${updatedCount}`);
    console.log(`   • Total boats processed: ${boatStats.length}`);

  } catch (error) {
    console.error('❌ Error calculating review statistics:', error);
    throw error;
  }
}

// Run the function
calculateAndUpdateReviewStats()
  .then(() => {
    console.log('🎉 Review statistics update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Review statistics update failed:', error);
    process.exit(1);
  }); 