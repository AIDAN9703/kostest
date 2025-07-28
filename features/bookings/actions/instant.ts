"use server";

import { db } from "@/database/db";
import { boats, bookings, boatPricingTiers } from "@/database/schema";
import { auth } from "@/auth";
import { bookingRequestSchema, BookingRequest } from "@/features/_validation/validations";
import { z } from "zod";
import { calculateEndDateTime } from "@/shared/utils/booking-utils";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
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
    
    // Calculate all fees - captain service is included in base price
    const basePrice = pricingTier.price;
    const captainFee = 0; // Captain service is included in base price
    const cleaningFee = boat.cleaningFee || 0;
    const subtotal = basePrice + captainFee + cleaningFee;
    const taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + taxAmount;
    
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
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
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
        specialRequests: validatedData.specialRequests || "",
        basePrice: basePrice.toString(),
        captainFee: captainFee.toString(),
        cleaningFee: cleaningFee.toString(),
        serviceFee: "0",
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        depositAmount: (boat.depositAmount || 0).toString(),
        createdAt: new Date().toISOString(),
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/boats/${boat.id}?canceled=true`,
    } as any);
    
    // Create a temporary booking record with pending status
    let bookingRecord = null;
    try {
      const now = new Date();
      const result = await db.insert(bookings).values({
        bookingType: "INSTANT_BOOK",
        bookingStatus: "AWAITING_PAYMENT",
        userId: session.user.id,
        boatId: boat.id,
        pricingTierId: validatedData.pricingTierId,
        
        // Customer information
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
        customerPhone: session.user.phoneNumber || "",
        
        // Booking details - NEW unified datetime fields
        isMultiDay: false,
        needsCaptain: validatedData.needsCaptain || boat.crewRequired,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        numberOfPassengers: validatedData.numberOfPassengers,
        specialRequests: validatedData.specialRequests || "",
        
        // Pricing
        captainFee: captainFee,
        cleaningFee: cleaningFee,
        serviceFee: 0,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        depositAmount: boat.depositAmount || 0,
        currency: "USD",
        
        // Payment information
        paymentStatus: "PENDING",
        paymentMethod: "card",
        stripePaymentLinkId: checkoutSession.id,
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      }).returning();

      bookingRecord = result[0];
      console.log("Created pending booking for session:", checkoutSession.id);
    } catch (error) {
      console.error("Error creating pending booking:", error);
      // Continue even if this fails - the webhook will create the booking
    }
    
    return { 
      success: true,
      paymentUrl: checkoutSession.url,
      booking: bookingRecord,
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