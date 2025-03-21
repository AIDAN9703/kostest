import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/database/db';
import { boats, boatCategoryEnum } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for boat creation
const boatSchema = z.object({
  name: z.string().min(3, "Boat name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  boatType: z.string().min(1, "Please select a boat type"),
  length: z.number().positive("Length must be a positive number"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  year: z.number().int().min(1900).max(new Date().getFullYear(), "Year must be valid"),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters"),
  pricePerDay: z.number().positive("Price must be a positive number"),
  location: z.object({
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
  }),
  mainImage: z.string().url("Please upload a main image").optional(),
  galleryImages: z.array(z.string().url()).optional(),
  ownerId: z.string(),
});

// Map boat type to category enum
const mapBoatTypeToCategory = (boatType: string): "PONTOON" | "YACHT" | "SAILBOAT" | "FISHING" | "SPEEDBOAT" | "HOUSEBOAT" | "JET_SKI" | "OTHER" => {
  switch (boatType) {
    case "Sailboat": return "SAILBOAT";
    case "Yacht": return "YACHT";
    case "Catamaran": return "SAILBOAT";
    case "Pontoon": return "PONTOON";
    case "Fishing Boat": return "FISHING";
    case "Speedboat": return "SPEEDBOAT";
    case "Houseboat": return "HOUSEBOAT";
    case "Jet Ski": return "JET_SKI";
    default: return "OTHER";
  }
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validatedData = boatSchema.parse(body);
    
    // Ensure the user can only create boats for themselves
    if (validatedData.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Create boat in database with required fields
    const result = await db.insert(boats).values({
      name: validatedData.name,
      description: validatedData.description,
      category: mapBoatTypeToCategory(validatedData.boatType),
      lengthFt: validatedData.length,
      capacity: validatedData.capacity,
      yearBuilt: validatedData.year,
      make: validatedData.manufacturer,
      mainImage: validatedData.mainImage || null,
      galleryImages: validatedData.galleryImages || [],
      ownerId: validatedData.ownerId,
      homePort: `${validatedData.location.city}, ${validatedData.location.state}`,
      fullDayPrice: validatedData.pricePerDay,
      hourlyRate: validatedData.pricePerDay / 8, // Estimate hourly rate
      features: [], // Required field
      active: false, // Default to inactive until approved
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // Return the created boat
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating boat:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    // Handle other errors
    return NextResponse.json({ 
      error: 'Failed to create boat',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const ownerIdParam = searchParams.get('ownerId');
    
    // If ownerId is provided, ensure it matches the authenticated user
    if (ownerIdParam && ownerIdParam !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Use the authenticated user's ID if no ownerId is specified
    const ownerId = ownerIdParam || session.user.id;
    
    // Query boats
    const results = await db.select().from(boats).where(eq(boats.ownerId, ownerId));
    
    // Process results to add UI-friendly fields
    const processedResults = results.map(boat => {
      // Extract city and state from homePort
      const [city = '', state = ''] = (boat.homePort?.split(',').map(part => part.trim()) || ['', '']);
      
      return {
        ...boat,
        // Add UI-friendly fields
        boatType: boat.category,
        manufacturer: boat.make,
        length: boat.lengthFt,
        year: boat.yearBuilt,
        pricePerDay: boat.fullDayPrice || (boat.hourlyRate ? boat.hourlyRate * 8 : 0),
        location: { city, state },
        // Ensure galleryImages is an array
        galleryImages: Array.isArray(boat.galleryImages) ? boat.galleryImages : [],
        // Add bookings count (placeholder)
        bookings: 0,
      };
    });
    
    // Return boats
    return NextResponse.json(processedResults);
  } catch (error) {
    console.error('Error fetching boats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch boats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 