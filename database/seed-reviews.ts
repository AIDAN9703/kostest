import { db } from "./db";
import { boats, reviews, users } from "./schema";
import { eq } from "drizzle-orm";

// Much more diverse reviewer names and profiles
const reviewerProfiles = [
  // Original names
  { firstName: "Sarah", lastName: "Johnson", email: "sarah.j@email.com" },
  { firstName: "Mike", lastName: "Chen", email: "mike.chen@email.com" },
  { firstName: "Emily", lastName: "Rodriguez", email: "emily.r@email.com" },
  { firstName: "David", lastName: "Thompson", email: "david.t@email.com" },
  { firstName: "Jessica", lastName: "Williams", email: "jessica.w@email.com" },
  { firstName: "Chris", lastName: "Anderson", email: "chris.a@email.com" },
  { firstName: "Amanda", lastName: "Brown", email: "amanda.b@email.com" },
  { firstName: "Ryan", lastName: "Davis", email: "ryan.d@email.com" },
  { firstName: "Lisa", lastName: "Wilson", email: "lisa.w@email.com" },
  { firstName: "Kevin", lastName: "Martinez", email: "kevin.m@email.com" },
  
  // Additional diverse names
  { firstName: "Olivia", lastName: "Parker", email: "olivia.parker@email.com" },
  { firstName: "Ethan", lastName: "Cooper", email: "ethan.cooper@email.com" },
  { firstName: "Sophia", lastName: "Mitchell", email: "sophia.mitchell@email.com" },
  { firstName: "Noah", lastName: "Bennett", email: "noah.bennett@email.com" },
  { firstName: "Isabella", lastName: "Rivera", email: "isabella.rivera@email.com" },
  { firstName: "Liam", lastName: "Foster", email: "liam.foster@email.com" },
  { firstName: "Emma", lastName: "Hughes", email: "emma.hughes@email.com" },
  { firstName: "Mason", lastName: "Powell", email: "mason.powell@email.com" },
  { firstName: "Ava", lastName: "Barnes", email: "ava.barnes@email.com" },
  { firstName: "Lucas", lastName: "Reed", email: "lucas.reed@email.com" },
  { firstName: "Mia", lastName: "Coleman", email: "mia.coleman@email.com" },
  { firstName: "Henry", lastName: "Griffin", email: "henry.griffin@email.com" },
  { firstName: "Charlotte", lastName: "Hayes", email: "charlotte.hayes@email.com" },
  { firstName: "Oliver", lastName: "Ward", email: "oliver.ward@email.com" },
  { firstName: "Amelia", lastName: "Torres", email: "amelia.torres@email.com" },
  { firstName: "Benjamin", lastName: "Price", email: "benjamin.price@email.com" },
  { firstName: "Harper", lastName: "Ross", email: "harper.ross@email.com" },
  { firstName: "William", lastName: "Morgan", email: "william.morgan@email.com" },
  { firstName: "Evelyn", lastName: "Bell", email: "evelyn.bell@email.com" },
  { firstName: "James", lastName: "Murphy", email: "james.murphy@email.com" },
  
  // International names
  { firstName: "Marco", lastName: "Santana", email: "marco.santana@email.com" },
  { firstName: "Priya", lastName: "Patel", email: "priya.patel@email.com" },
  { firstName: "Jean-Luc", lastName: "Dubois", email: "jean.dubois@email.com" },
  { firstName: "Yuki", lastName: "Tanaka", email: "yuki.tanaka@email.com" },
  { firstName: "Carlos", lastName: "Mendoza", email: "carlos.mendoza@email.com" },
  { firstName: "Elena", lastName: "Volkov", email: "elena.volkov@email.com" },
  { firstName: "Ahmed", lastName: "Hassan", email: "ahmed.hassan@email.com" },
  { firstName: "Sophie", lastName: "Larsson", email: "sophie.larsson@email.com" },
  { firstName: "Diego", lastName: "Silva", email: "diego.silva@email.com" },
  { firstName: "Fatima", lastName: "Al-Rashid", email: "fatima.alrashid@email.com" },
  { firstName: "Giovanni", lastName: "Romano", email: "giovanni.romano@email.com" },
  { firstName: "Anastasia", lastName: "Petrov", email: "anastasia.petrov@email.com" },
  { firstName: "Kai", lastName: "Nakamura", email: "kai.nakamura@email.com" },
  { firstName: "Maria", lastName: "Gonzalez", email: "maria.gonzalez@email.com" },
  { firstName: "Dmitri", lastName: "Ivanov", email: "dmitri.ivanov@email.com" },
  
  // Creative/Professional names
  { firstName: "Dr. Patricia", lastName: "Edwards", email: "patricia.edwards@email.com" },
  { firstName: "Captain John", lastName: "Morrison", email: "john.morrison@email.com" },
  { firstName: "Alexandra", lastName: "Stone-Wells", email: "alex.stonewells@email.com" },
  { firstName: "Michael Jr.", lastName: "Washington", email: "michael.washington@email.com" },
  { firstName: "Samantha", lastName: "O'Brien", email: "sam.obrien@email.com" },
  { firstName: "Robert", lastName: "Van Der Berg", email: "robert.vanderberg@email.com" },
  { firstName: "Catherine", lastName: "MacLeod", email: "catherine.macleod@email.com" },
  { firstName: "Anthony", lastName: "De La Cruz", email: "anthony.delacruz@email.com" },
];

// Enhanced review content templates with more variety and higher quality
const reviewTemplates = {
  5: [
    "Absolutely incredible experience! The boat was pristine and the captain was amazing. Highly recommend!",
    "Perfect day on the water! Everything exceeded our expectations. The crew was professional and friendly.",
    "Outstanding charter experience! Beautiful boat, great service, and unforgettable memories.",
    "Five stars all the way! The boat was exactly as advertised and the captain went above and beyond.",
    "Couldn't have asked for a better day! The boat was immaculate and the service was top-notch.",
    "Amazing experience from start to finish! Professional crew, beautiful boat, perfect weather.",
    "Best boat charter we've ever done! The captain was knowledgeable and the boat was stunning.",
    "Phenomenal day on the water! Everything was perfect - the boat, crew, and overall experience.",
    "This charter exceeded every expectation! The boat was luxurious, crew was fantastic, and we saw dolphins!",
    "Absolutely magical day! The sunset cruise was breathtaking and the captain found the perfect spots.",
    "Flawless experience! The boat was immaculate, crew was attentive, and the views were spectacular.",
    "Cannot recommend this enough! Professional service, gorgeous boat, and memories that will last forever.",
    "Best money we've ever spent! The captain was incredibly knowledgeable about local waters and wildlife.",
    "Perfect for our anniversary celebration! The crew made everything special and the boat was luxurious.",
    "Outstanding service from booking to departure! The boat exceeded photos and the crew was wonderful.",
    "Incredible value for an unforgettable experience! Will definitely book again for future celebrations.",
    "The highlight of our vacation! Beautiful boat, amazing crew, and perfect weather made it magical.",
    "World-class charter experience! Every detail was perfect and the captain's expertise really showed.",
    "Couldn't be happier with our choice! The boat was stunning and the crew went above and beyond.",
    "Perfect day on the water! Great for families - kids loved it and adults could relax completely.",
  ],
  4: [
    "Great experience overall! The boat was nice and the captain was helpful. Minor delay at start but worth it.",
    "Really enjoyed our day! Beautiful boat and good service. Would definitely book again.",
    "Solid charter experience. The boat was clean and well-maintained. Captain was professional.",
    "Had a wonderful time! The boat was gorgeous and the crew was accommodating. Slight communication issues but overall great.",
    "Very good experience! The boat met our expectations and the captain was friendly and knowledgeable.",
    "Enjoyed our charter! The boat was beautiful and the service was good. Minor issues with timing but overall positive.",
    "Good day on the water! The boat was nice and the captain was experienced. Would recommend.",
    "Really nice charter! The boat was well-equipped and the crew was helpful. Small hiccup with departure time.",
    "Great boat and friendly crew! A few minor issues but nothing that affected our enjoyment significantly.",
    "Lovely day out! The boat was comfortable and clean. Captain was knowledgeable about the area.",
    "Good value for money! Boat was as described and crew was professional. Would book again.",
    "Pleasant experience! The boat was nice and crew was friendly. Could improve on communication beforehand.",
    "Solid choice for a day charter! Boat was well-maintained and captain was experienced.",
    "Good times on the water! Boat was comfortable and crew made sure we had everything we needed.",
    "Nice charter experience! Boat was clean and crew was accommodating. Minor weather delays but understandable.",
  ],
  3: [
    "Decent experience but had some issues with communication beforehand. The boat itself was fine.",
    "The boat was nice but we had some delays. Overall okay but room for improvement.",
    "Mixed experience. Beautiful boat but service could be better. Captain was friendly though.",
    "Average charter experience. The boat was clean but had some minor maintenance issues.",
    "Okay experience overall. The boat was as described but coordination could be improved.",
    "Fair charter experience. Boat was decent and crew was okay. Expected a bit more for the price.",
    "The boat was nice enough but had some operational issues. Crew tried their best to accommodate.",
  ]
};

// Enhanced review titles with more variety
const reviewTitles = {
  5: [
    "Perfect Day on the Water!",
    "Exceeded All Expectations!",
    "Outstanding Charter Experience",
    "Absolutely Amazing!",
    "Five Star Experience",
    "Incredible Day Out",
    "Best Charter Ever!",
    "Magical Day on the Water",
    "Unforgettable Experience!",
    "World-Class Service",
    "Perfect Celebration Charter",
    "Exceptional Quality & Service",
    "Breathtaking Views & Perfect Crew",
    "Luxurious & Professional",
    "Highlight of Our Vacation",
    "Flawless Charter Experience",
    "Stunning Boat, Amazing Crew",
    "Couldn't Ask for Better!",
    "Top-Notch Charter Service",
    "Perfect Family Adventure",
  ],
  4: [
    "Great Experience Overall",
    "Really Enjoyed Our Charter",
    "Solid Boat and Service",
    "Good Day on the Water",
    "Would Book Again",
    "Nice Charter Experience",
    "Pleasant Day Out",
    "Good Value Charter",
    "Comfortable & Clean Boat",
    "Professional & Friendly Crew",
    "Lovely Day on the Water",
    "Well-Maintained Boat",
    "Good Times & Nice Views",
    "Solid Charter Choice",
  ],
  3: [
    "Decent Experience",
    "Average Charter",
    "Okay Overall",
    "Mixed Experience",
    "Fair Charter Service",
    "Room for Improvement",
  ]
};

// Function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a random date within the last 2 years
function getRandomDate(): Date {
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  return new Date(randomTime);
}

// Function to generate review count based on distribution
function getReviewCount(): number {
  const rand = Math.random();
  
  if (rand < 0.15) return 0;          // 15% have 0 reviews (reduced from 20%)
  if (rand < 0.40) return Math.floor(Math.random() * 6) + 2;     // 25% have 2-7 reviews
  if (rand < 0.75) return Math.floor(Math.random() * 12) + 8;    // 35% have 8-19 reviews
  return Math.floor(Math.random() * 20) + 20;                   // 25% have 20-39 reviews (increased)
}

// Function to generate weighted rating (90% high ratings now)
function getWeightedRating(): number {
  const rand = Math.random();
  
  if (rand < 0.90) {
    // 90% get 4.5-5.0 ratings (increased from 80%)
    return Math.random() < 0.75 ? 5 : 4; // 75% get 5 stars, 25% get 4 stars
  } else {
    // 10% get 3-4 ratings (reduced from 20%)
    return Math.random() < 0.5 ? 4 : 3;
  }
}

export async function seedReviews() {
  console.log("🌱 Starting review seeding process...");
  
  try {
    // First, clear existing reviews
    await db.delete(reviews);
    console.log("🗑️  Cleared existing reviews");
    
    // Get all active boats
    const allBoats = await db.select({ id: boats.id, name: boats.name }).from(boats).where(eq(boats.active, true));
    console.log(`📋 Found ${allBoats.length} active boats`);
    
    // Create or get reviewer users
    const reviewerUsers = [];
    for (const profile of reviewerProfiles) {
      try {
        // Try to find existing user
        const existingUser = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
        
        if (existingUser.length > 0) {
          reviewerUsers.push(existingUser[0]);
        } else {
          // Create new reviewer user
          const [newUser] = await db.insert(users).values({
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            username: profile.email, // Use email as username for simplicity
            password: 'temp_password_123', // Temporary password - these are fake review accounts
            emailVerified: true,
            role: 'USER',
            displayName: `${profile.firstName} ${profile.lastName}`,
          }).returning();
          reviewerUsers.push(newUser);
        }
      } catch (error) {
        console.warn(`⚠️  Could not create reviewer ${profile.email}:`, error);
      }
    }
    
    console.log(`👥 Created/found ${reviewerUsers.length} reviewer accounts`);
    
    let totalReviewsCreated = 0;
    let boatsWithReviews = 0;
    
    // Generate reviews for each boat
    for (const boat of allBoats) {
      const reviewCount = getReviewCount();
      
      if (reviewCount === 0) {
        console.log(`⭕ Boat "${boat.name}" - No reviews (as intended)`);
        continue;
      }
      
      boatsWithReviews++;
      const boatReviews = [];
      
      // Generate reviews for this boat
      for (let i = 0; i < reviewCount; i++) {
        const rating = getWeightedRating();
        const reviewer = getRandomItem(reviewerUsers);
        const reviewDate = getRandomDate();
        
        const reviewData = {
          type: 'BOAT' as const,
          status: 'PUBLISHED' as const,
          reviewerId: reviewer.id,
          reviewedBoatId: boat.id,
          rating: rating,
          title: getRandomItem(reviewTitles[rating as keyof typeof reviewTitles] || reviewTitles[5]),
          content: getRandomItem(reviewTemplates[rating as keyof typeof reviewTemplates] || reviewTemplates[5]),
          isVerified: Math.random() < 0.8, // 80% of reviews are verified (increased)
          isFeatured: Math.random() < 0.05, // 5% are featured (reduced to be more exclusive)
          helpfulCount: Math.floor(Math.random() * 8), // 0-7 helpful votes (increased)
          createdAt: reviewDate,
          updatedAt: reviewDate,
        };
        
        boatReviews.push(reviewData);
      }
      
      // Insert all reviews for this boat
      await db.insert(reviews).values(boatReviews);
      
      // Calculate average rating for logging
      const avgRating = (boatReviews.reduce((sum, r) => sum + r.rating, 0) / boatReviews.length).toFixed(1);
      
      console.log(`⭐ Boat "${boat.name}" - ${reviewCount} reviews, ${avgRating}★ average`);
      totalReviewsCreated += reviewCount;
    }
    
    console.log("\n✅ Review seeding completed!");
    console.log(`📊 Statistics:`);
    console.log(`   • Total boats: ${allBoats.length}`);
    console.log(`   • Boats with reviews: ${boatsWithReviews}`);
    console.log(`   • Boats without reviews: ${allBoats.length - boatsWithReviews}`);
    console.log(`   • Total reviews created: ${totalReviewsCreated}`);
    console.log(`   • Average reviews per boat: ${(totalReviewsCreated / boatsWithReviews).toFixed(1)}`);
    
  } catch (error) {
    console.error("❌ Error seeding reviews:", error);
    throw error;
  }
}

// Run the seeder if called directly
if (require.main === module) {
  seedReviews()
    .then(() => {
      console.log("🎉 Review seeding finished successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Review seeding failed:", error);
      process.exit(1);
    });
} 