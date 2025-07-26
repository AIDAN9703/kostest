#!/usr/bin/env tsx

/**
 * Complete Review System Setup
 * 
 * This script will:
 * 1. Create exactly 20 fake users
 * 2. Create 1-5 reviews per boat, all 5-star reviews
 * 3. Update boat review statistics
 * 
 * Run this script to set up your complete review system:
 * npx tsx database/setup-reviews.ts
 */

import { seedReviews } from '@/database/scripts/seed-reviews';
import { calculateAndUpdateReviewStats } from '@/database/scripts/calculate-review-stats';

async function setupCompleteReviewSystem() {
  console.log("🚀 Setting up complete review system...");
  console.log("=" .repeat(60));
  
  try {
    // Step 1: Create fake users and reviews
    console.log("📝 Step 1: Creating fake users and reviews...");
    await seedReviews();
    
    console.log("\n" + "=" .repeat(60));
    
    // Step 2: Update boat statistics
    console.log("📊 Step 2: Updating boat review statistics...");
    await calculateAndUpdateReviewStats();
    
    console.log("\n" + "=" .repeat(60));
    console.log("✅ Complete review system setup finished successfully!");
    console.log("");
    console.log("📋 Summary of what was created:");
    console.log("   • 20 fake users with diverse, realistic names");
    console.log("   • 1-5 reviews per boat (randomly distributed)");
    console.log("   • All reviews are 5-star ratings");
    console.log("   • No duplicate users per boat");
    console.log("   • Boat statistics updated with new review data");
    console.log("");
    console.log("🎉 Your review system is now ready!");
    
  } catch (error) {
    console.error("💥 Error during review system setup:", error);
    process.exit(1);
  }
}

// Run the script
setupCompleteReviewSystem(); 