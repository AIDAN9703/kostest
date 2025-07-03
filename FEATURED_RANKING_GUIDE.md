# Featured Fleet Ordering & Search Ranking Guide

## Overview

I've added two new fields to your boat schema to give you more control over how boats are displayed and ranked:

1. **`featuredOrder`** - Integer field for controlling the exact order of boats in your featured fleet
2. **`searchRankingScore`** - Double precision field for advanced search algorithms

## Database Changes

### New Fields Added to `boats` table:
- `featured_order` (integer) - Order for featured fleet display (lower = higher priority)
- `search_ranking_score` (double precision, default 0) - Score for advanced search algorithms

### New Indexes:
- `boat_featured_idx` - Optimizes queries for featured boats with ordering
- `boat_ranking_idx` - Optimizes queries by search ranking score

## How to Use Featured Ordering

### 1. Simple Featured Fleet Display
Your featured fleet will now automatically order boats by `featuredOrder` (lowest number first), then by creation date as fallback.

```typescript
// This is already implemented in your getFeaturedBoats() action
const featuredBoats = await db
  .select()
  .from(boats)
  .where(eq(boats.featured, true))
  .orderBy(boats.featuredOrder, boats.createdAt);
```

### 2. Admin Management
Use the new admin actions to manage featured boat ordering:

```typescript
import { 
  getFeaturedBoatsForAdmin, 
  addBoatToFeatured, 
  removeBoatFromFeatured,
  reorderFeaturedBoats 
} from '@/lib/actions/admin/featured-boats';

// Get all featured boats with ordering info
const featuredBoats = await getFeaturedBoatsForAdmin();

// Add a boat to featured with specific order
await addBoatToFeatured(boatId, 1); // Will appear first

// Reorder boats (useful for drag-and-drop)
await reorderFeaturedBoats(['boat1', 'boat2', 'boat3']); // boat1 becomes order 1, boat2 becomes order 2, etc.
```

### 3. Setting Featured Order
```typescript
// Set a boat as featured with order 1 (will appear first)
await db
  .update(boats)
  .set({ 
    featured: true, 
    featuredOrder: 1,
    updatedAt: new Date() 
  })
  .where(eq(boats.id, boatId));

// Set a boat as featured with order 5 (will appear fifth)
await db
  .update(boats)
  .set({ 
    featured: true, 
    featuredOrder: 5,
    updatedAt: new Date() 
  })
  .where(eq(boats.id, boatId));
```

## How to Use Search Ranking

### 1. Basic Search Ranking
The `searchRankingScore` field can be used in your search queries:

```typescript
// Order search results by ranking score
const searchResults = await db
  .select()
  .from(boats)
  .where(/* your search conditions */)
  .orderBy(boats.searchRankingScore, boats.createdAt);
```

### 2. Advanced Search Algorithm
Use the provided utility functions for sophisticated ranking:

```typescript
import { calculateSearchRankingScore, sortBoatsByRanking } from '@/lib/utils/search-ranking';

// Calculate ranking for a specific boat
const rankingFactors = {
  userLocation: { lat: 25.7617, lng: -80.1918 }, // Miami
  userBudget: { min: 500, max: 2000 },
  userCapacity: 8,
  userExperience: 'INTERMEDIATE' as const,
  boatRating: 4.8,
  boatReviewCount: 25,
  boatBookingCount: 50,
  boatAge: 3,
  boatAvailability: true
};

const score = calculateSearchRankingScore(boat, rankingFactors);

// Sort a list of boats by ranking
const sortedBoats = sortBoatsByRanking(boats, rankingFactors);
```

### 3. Updating Ranking Scores
You can update ranking scores based on various factors:

```typescript
// Example: Update ranking based on performance metrics
async function updateBoatRanking(boatId: string) {
  const boat = await getBoatById(boatId);
  
  let score = 0;
  
  // Base score from reviews
  if (boat.averageRating) {
    score += boat.averageRating * 20;
  }
  
  // Popularity boost
  if (boat.totalBookings) {
    score += Math.min(boat.totalBookings * 0.5, 30);
  }
  
  // Featured boost
  if (boat.featured) {
    score += 100;
  }
  
  // Update the database
  await db
    .update(boats)
    .set({ 
      searchRankingScore: score,
      updatedAt: new Date() 
    })
    .where(eq(boats.id, boatId));
}
```

## Migration

Run the migration to add the new fields:

```bash
# Apply the migration
npm run db:migrate

# Or if using drizzle-kit directly
npx drizzle-kit push
```

## Example Use Cases

### 1. Featured Fleet Management
```typescript
// Set up your featured fleet in order
const featuredBoats = [
  { id: 'luxury-yacht-1', order: 1 },
  { id: 'family-cruiser-2', order: 2 },
  { id: 'fishing-boat-3', order: 3 },
];

for (const boat of featuredBoats) {
  await addBoatToFeatured(boat.id, boat.order);
}
```

### 2. Search Result Optimization
```typescript
// In your search function
const searchResults = await db
  .select()
  .from(boats)
  .where(and(
    eq(boats.active, true),
    gte(boats.capacity, userCapacity),
    // ... other filters
  ))
  .orderBy(boats.searchRankingScore, boats.createdAt);
```

### 3. Dynamic Ranking Updates
```typescript
// Update rankings periodically or after significant events
async function updateAllBoatRankings() {
  const allBoats = await getAllBoats();
  
  for (const boat of allBoats) {
    const score = calculateSearchRankingScore(boat, {
      boatRating: boat.averageRating,
      boatReviewCount: boat.totalReviews,
      boatBookingCount: boat.totalBookings,
      // ... other factors
    });
    
    await updateBoatRankingScore(boat.id, score);
  }
}
```

## Benefits

1. **Precise Control**: You can now control exactly which boats appear first in your featured fleet
2. **Flexible Ranking**: The search ranking system can be customized based on your business logic
3. **Performance**: New indexes optimize queries for both featured and ranked searches
4. **Scalability**: The system can handle complex ranking algorithms as your business grows

## Next Steps

1. Run the migration to add the new fields
2. Update your admin interface to include featured ordering controls
3. Implement the search ranking algorithm in your search functionality
4. Consider setting up periodic ranking updates based on boat performance

This system gives you the foundation for both simple featured ordering and sophisticated search ranking algorithms that can evolve with your business needs. 