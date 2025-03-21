import { db } from './db';
import { boats, users, boatCategoryEnum } from './schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// First, we need to make sure we have at least one user to be the owner
async function ensureOwnerExists() {
  // Only select id to avoid issues with missing columns
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
  
  if (existingUsers.length === 0) {
    // Create a default owner if no users exist
    // Only include fields that definitely exist in the database
    await db.insert(users).values({
      email: 'owner@example.com',
      username: 'boatowner',
      password: '$2a$10$8Ux8xJFKZSAiCIWUG4JXAOcQY0Zl/WOSw8vXXP.MZ6gU5V4m3dUUa', // password: password123
      firstName: 'Boat',
      lastName: 'Owner',
      displayName: 'Boat Owner',
      phoneNumber: '555-123-4567',
      role: 'OWNER',
      isBoatOwner: true,
      ownerOnboardingComplete: true,
      emailVerified: true,
      phoneVerified: true,
      signupComplete: true,
      profileCompletionPercentage: 100
    });
    
    // Get the newly created user, only select id
    const newUser = await db.select({ id: users.id }).from(users).where(eq(users.email, 'owner@example.com')).limit(1);
    console.log('Created default owner with ID:', newUser[0].id);
    return newUser[0].id;
  }
  
  return existingUsers[0].id;
}

// Boat names
const boatNames = [
  'Sea Breeze', 'Ocean Voyager', 'Coastal Cruiser', 'Wave Dancer', 'Blue Horizon',
  'Sunset Chaser', 'Island Hopper', 'Aqua Dream', 'Wind Seeker', 'Marina Star',
  'Bay Wanderer', 'Tide Runner', 'Harbor Master', 'Gulf Stream', 'Coral Explorer',
  'Nautical Escape', 'Seaside Retreat', 'Coastal Gem', 'Reef Rider', 'Lagoon Drifter'
];

// Boat makes
const boatMakes = [
  'Sea Ray', 'Boston Whaler', 'Bayliner', 'Chaparral', 'Grady-White',
  'Mastercraft', 'Yamaha', 'Malibu', 'Cobalt', 'Regal',
  'Chris-Craft', 'Formula', 'Monterey', 'Crownline', 'Bennington',
  'Nautique', 'Tracker', 'Beneteau', 'Catalina', 'Hunter'
];

// Boat models
const boatModels = [
  'Sundancer 320', 'Outrage 250', 'Element E18', 'Signature 250', 'Freedom 285',
  'X24', 'AR240', 'Wakesetter 23', 'R6', 'LS2',
  'Launch 28', 'FX 350', 'M65', 'E4', 'Q25',
  'G23', 'Pro Team 190', 'Oceanis 40.1', 'Catalina 315', 'Marlow-Hunter 31'
];

// Features
const allFeatures = [
  'Air Conditioning', 'Bluetooth Sound System', 'Cabin', 'Cooler', 'Depth Finder',
  'Fish Finder', 'Fishing Gear', 'GPS', 'Grill', 'Kitchenette',
  'Life Jackets', 'Live Bait Well', 'Microwave', 'Refrigerator', 'Shower',
  'Sink', 'Snorkeling Gear', 'Stereo System', 'Swim Ladder', 'Toilet',
  'TV', 'USB Charging', 'Wake Board Rack', 'Water Skis', 'WiFi'
];

// Amenities
const allAmenities = [
  'Bathroom', 'Bedroom', 'Bluetooth Speakers', 'Cooler', 'Deck Shower',
  'Dining Area', 'Fishing Equipment', 'Galley Kitchen', 'Grill', 'Ice Maker',
  'Kitchenette', 'Paddle Boards', 'Refrigerator', 'Seating Area', 'Shade Cover',
  'Shower', 'Snorkeling Gear', 'Sunbathing Area', 'Swim Platform', 'Towels',
  'TV', 'USB Charging', 'Water Toys', 'Wet Bar', 'WiFi'
];

// Safety equipment
const allSafetyEquipment = [
  'Life Jackets', 'Fire Extinguisher', 'First Aid Kit', 'Flares', 'Throwable Flotation Device',
  'VHF Radio', 'GPS', 'Compass', 'Anchor', 'Bilge Pump',
  'Navigation Lights', 'Horn', 'Whistle', 'Life Raft', 'Emergency Position Indicating Radio Beacon'
];

// Home ports
const homePorts = [
  'Miami Marina', 'San Diego Harbor', 'Newport Beach', 'Seattle Waterfront', 'Chicago Harbor',
  'Boston Harbor', 'Tampa Bay Marina', 'Fort Lauderdale Yacht Club', 'San Francisco Bay', 'Lake Tahoe Marina',
  'Annapolis Harbor', 'Charleston Marina', 'Hilton Head Island', 'Galveston Bay', 'Lake Michigan Harbor',
  'Lake Powell', 'Lake Havasu', 'Chesapeake Bay', 'Long Beach Marina', 'Cape Cod Harbor'
];

// Location data for major US coastal cities
const locationData = [
  { city: 'Miami Marina', lat: 25.7617, lng: -80.1918 },
  { city: 'San Diego Harbor', lat: 32.7157, lng: -117.1611 },
  { city: 'Newport Beach', lat: 33.6189, lng: -117.9298 },
  { city: 'Seattle Waterfront', lat: 47.6062, lng: -122.3321 },
  { city: 'Chicago Harbor', lat: 41.8781, lng: -87.6298 },
  { city: 'Boston Harbor', lat: 42.3601, lng: -71.0589 },
  { city: 'Tampa Bay Marina', lat: 27.9506, lng: -82.4572 },
  { city: 'Fort Lauderdale Yacht Club', lat: 26.1224, lng: -80.1373 },
  { city: 'San Francisco Bay', lat: 37.7749, lng: -122.4194 },
  { city: 'Lake Tahoe Marina', lat: 39.0968, lng: -120.0324 },
  { city: 'Annapolis Harbor', lat: 38.9784, lng: -76.4922 },
  { city: 'Charleston Marina', lat: 32.7765, lng: -79.9311 },
  { city: 'Hilton Head Island', lat: 32.2163, lng: -80.7526 },
  { city: 'Galveston Bay', lat: 29.3013, lng: -94.7977 },
  { city: 'Lake Michigan Harbor', lat: 43.0389, lng: -87.9065 },
  { city: 'Lake Powell', lat: 37.0642, lng: -111.2501 },
  { city: 'Lake Havasu', lat: 34.4839, lng: -114.3224 },
  { city: 'Chesapeake Bay', lat: 37.8270, lng: -76.0640 },
  { city: 'Long Beach Marina', lat: 33.7701, lng: -118.1937 },
  { city: 'Cape Cod Harbor', lat: 41.6688, lng: -70.2962 }
];

// Helper function to get random items from an array
function getRandomItems(array: string[], min: number, max: number): string[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get a random item from an array
function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get a random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get a random price
function getRandomPrice(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Helper function to get a random boolean with a probability
function getRandomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

// Helper function to get a random location
function getRandomLocation() {
  return locationData[Math.floor(Math.random() * locationData.length)];
}

// Main function to seed boats
async function seedBoats() {
  try {
    console.log('Starting to seed boats...');
    
    // Ensure we have an owner
    const ownerId = await ensureOwnerExists();
    
    // Create 20 boats
    for (let i = 0; i < 20; i++) {
      const yearBuilt = getRandomNumber(2000, 2023);
      const lengthFt = getRandomNumber(18, 60);
      const capacity = getRandomNumber(4, 20);
      const cabins = getRandomNumber(0, 5);
      const bathrooms = getRandomNumber(0, 3);
      
      // Get a random location
      const location = getRandomLocation();
      
      await db.insert(boats).values({
        name: boatNames[i],
        displayTitle: `${boatNames[i]} - ${lengthFt}ft ${getRandomItem(boatMakes)} ${getRandomItem(boatModels)}`,
        description: `Experience the ultimate boating adventure on the ${boatNames[i]}. This beautiful ${lengthFt}-foot ${getRandomItem(boatMakes)} is perfect for day trips, fishing excursions, or sunset cruises.`,
        category: getRandomItem(boatCategoryEnum.enumValues),
        active: true,
        featured: getRandomBoolean(0.3),
        
        // Owner Information
        ownerId: ownerId,
        ownerEmail: 'owner@example.com',
        
        // Boat Specifications
        make: getRandomItem(boatMakes),
        model: getRandomItem(boatModels),
        yearBuilt: yearBuilt,
        lengthFt: lengthFt,
        capacity: capacity,
        cabins: cabins,
        bathrooms: bathrooms,
        showers: getRandomNumber(0, bathrooms),
        sleeps: getRandomNumber(0, cabins * 2 + 2),
        beam: parseFloat((Math.random() * (20 - 6) + 6).toFixed(1)),
        draft: parseFloat((Math.random() * (6 - 1) + 1).toFixed(1)),
        weight: getRandomNumber(1000, 20000),
        fuelType: getRandomItem(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
        engineType: getRandomItem(['Outboard', 'Inboard', 'Stern Drive', 'Jet Drive']),
        enginePower: `${getRandomNumber(90, 500)} HP`,
        maxSpeed: getRandomNumber(15, 50),
        cruisingSpeed: getRandomNumber(8, 30),
        range: getRandomNumber(100, 500),
        
        // Features
        features: getRandomItems(allFeatures, 5, 15),
        amenities: getRandomItems(allAmenities, 3, 10),
        safetyEquipment: getRandomItems(allSafetyEquipment, 5, 10),
        
        // Media
        mainImage: `https://source.unsplash.com/random/800x600/?boat,yacht&sig=${i}`,
        galleryImages: Array.from({ length: getRandomNumber(3, 8) }, (_, j) => 
          `https://source.unsplash.com/random/800x600/?boat,yacht&sig=${i}-${j}`
        ),
        
        // Pricing
        hourlyRate: getRandomPrice(100, 500),
        halfDayPrice: getRandomPrice(400, 1500),
        fullDayPrice: getRandomPrice(800, 3000),
        weeklyRate: getRandomPrice(5000, 20000),
        depositAmount: getRandomPrice(500, 2000),
        cleaningFee: getRandomPrice(50, 200),
        taxRate: parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)),
        
        // Location
        homePort: location.city,
        currentLocation: location.city,
        // Use PostGIS point for location
        location: sql`ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)`,
        
        // Charter Options
        crewRequired: getRandomBoolean(0.6),
        crewIncluded: getRandomBoolean(0.4),
        crewSize: getRandomNumber(1, 5),
        dayCharter: true,
        termCharter: getRandomBoolean(0.3),
        minimumCharterDays: getRandomNumber(1, 7),
        
        // Fuel Details
        fuelIncluded: getRandomBoolean(0.3),
        fuelCapacity: getRandomNumber(50, 500),
        waterCapacity: getRandomNumber(20, 200),
        
        // Rules & Instructions
        rules: 'No smoking. No pets. No shoes on deck. No fishing in marina. Return with full fuel tank.',
        specialInstructions: 'Please arrive 15 minutes before departure for safety briefing.',
        cancellationPolicy: 'Full refund up to 7 days before. 50% refund up to 3 days before. No refund after that.',
        
        // Availability
        availableWeekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        minRentalHours: getRandomNumber(2, 4),
        maxRentalDays: getRandomNumber(7, 30),
        advanceBookingDays: getRandomNumber(1, 90),
      });
    }
    
    console.log(`Successfully seeded 20 boats!`);
  } catch (error) {
    console.error('Error seeding boats:', error);
  }
}

// Run the seed function
seedBoats()
  .then(() => {
    console.log('Boat seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed boats:', error);
    process.exit(1);
  }); 