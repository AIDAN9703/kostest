"use server";

import { db } from "@/database/db";
import { boats, boatPricingTiers, bookings } from "@/database/schema";
import { auth } from "@/auth";
import { bookingRequestSchema, BookingRequest } from "@/features/_validation/validations";
import { z } from "zod";
import { calculateEndDateTime } from "@/shared/utils/booking-utils";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { calculateBookingPrice } from "@/shared/utils/pricing-utils";

/**
 * Helper function to ensure we have a proper base URL with scheme
 */
function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // If no base URL is set, use localhost for development
  if (!baseUrl) {
    return process.env.NODE_ENV === "development" 
      ? "http://localhost:3000" 
      : "https://www.kosyachts.com";
  }
  
  // If base URL doesn't have a scheme, add https
  if (!baseUrl.startsWith("http")) {
    return `https://${baseUrl}`;
  }
  
  return baseUrl;
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.NODE_ENV === "development" ? process.env.STRIPE_SECRET_KEY! : process.env.STRIPE_LIVE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

/**
 * Creates a Stripe Checkout session for instant booking using pricing tiers
 * The actual booking will be created after payment success via webhook
 */
export async function createInstantBooking(data: BookingRequest & { boatId: string }) {
  // Check for authentication
  const session = await auth();
  if (!session?.user) {
    return { 
      success: false, 
      error: "You must be signed in to book", 
      errorType: "AUTH"
    };
  }

  try {
    // Validate the booking data
    const validatedData = bookingRequestSchema.parse(data);
    
    // Get the pricing tier details
    const pricingTierResults = await db
      .select()
      .from(boatPricingTiers)
      .where(eq(boatPricingTiers.id, validatedData.pricingTierId));
    
    if (pricingTierResults.length === 0) {
      return { 
        success: false, 
        error: "Invalid pricing tier selected" 
      };
    }
    
    const pricingTier = pricingTierResults[0];
    
    // Get boat details
    const boatResults = await db
      .select({
        id: boats.id,
        name: boats.name,
        cleaningFee: boats.cleaningFee, 
        depositAmount: boats.depositAmount,
        ownerId: boats.ownerId,
        instantBook: boats.instantBook,
        mainImage: boats.mainImage,
        crewRequired: boats.crewRequired,
      })
      .from(boats)
      .where(eq(boats.id, data.boatId));
    
    if (boatResults.length === 0) {
      return { 
        success: false, 
        error: "Boat not found" 
      };
    }
    
    const boat = boatResults[0];
    
    // Verify boat allows instant booking
    if (!boat.instantBook) {
      return {
        success: false,
        error: "This boat does not support instant booking"
      };
    }
    
    // Convert ISO string to Date object and calculate end datetime
    const startDateTime = new Date(validatedData.startDateTime);
    const endDateTime = calculateEndDateTime(startDateTime, pricingTier.hours);
    
    // Calculate all fees using universal pricing function
    const priceBreakdown = calculateBookingPrice(
      pricingTier.price,
      boat.cleaningFee || 0,
      0 // Captain service is included in base price
    );
    
    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${boat.name} - ${pricingTier.name || `${pricingTier.hours}hr Charter`}`,
              images: [boat.mainImage || "https://via.placeholder.com/800x600.png?text=Boat+Image"],
              description: `${validatedData.needsCaptain || boat.crewRequired ? "With Captain" : "Self-Drive"} - ${startDateTime.toLocaleDateString()} at ${startDateTime.toLocaleTimeString()}`
            },
            unit_amount: Math.round(priceBreakdown.totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        // Store all booking data needed to create a booking record after payment
        bookingType: "INSTANT_BOOK",
        boatId: boat.id,
        userId: session.user.id,
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
        customerPhone: session.user.phoneNumber || "",
        isMultiDay: "false",
        needsCaptain: (validatedData.needsCaptain || boat.crewRequired).toString(),
        startDateTime: validatedData.startDateTime,
        endDateTime: endDateTime.toISOString(),
        pricingTierId: validatedData.pricingTierId,
        numberOfPassengers: validatedData.numberOfPassengers.toString(),
        basePrice: priceBreakdown.basePrice.toString(),
        captainFee: priceBreakdown.captainFee.toString(),
        cleaningFee: priceBreakdown.cleaningFee.toString(),
        serviceFee: priceBreakdown.serviceFee.toString(),
        totalAmount: priceBreakdown.totalPrice.toString(),
        depositAmount: (boat.depositAmount || 0).toString(),
        createdAt: new Date().toISOString(),
      },
      mode: 'payment',
      allow_promotion_codes: true, // ✨ Enable Stripe's built-in coupon input
      success_url: `${getBaseUrl()}/bookings/${boat.id}/success?type=instant&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/boats/${boat.id}?canceled=true`,
    } as any);
    
    // No pending booking creation - webhook handles everything
    return { 
      success: true,
      paymentUrl: checkoutSession.url,
      message: "Redirecting to payment page."
    };
  } catch (error) {
    console.error("Instant booking error:", error);
    
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return { 
        success: false, 
        error: "Invalid booking data", 
        fieldErrors: error.flatten().fieldErrors 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to create booking. Please try again." 
    };
  }
}

/**
 * Server action for form submissions
 */
export async function createInstantBookingAction(formData: FormData) {
  // Parse form data
  const data = {
    boatId: formData.get("boatId") as string,
    startDateTime: formData.get("startDateTime") as string,
    pricingTierId: formData.get("pricingTierId") as string,
    numberOfPassengers: parseInt(formData.get("numberOfPassengers") as string),
    needsCaptain: formData.get("needsCaptain") === "true",
    specialRequests: formData.get("specialRequests") as string,
  };

  return await createInstantBooking(data);
}  