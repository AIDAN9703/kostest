import { z } from "zod";

/**
 * Authentication Schemas
 */
export const signUpSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3, "Last name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  birthday: z.string().min(10, "Please enter a valid date"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  rememberMe: z.boolean().optional(),
});

// New schema for phone verification during sign-up
export const phoneVerificationSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).nullable(),
  lastName: z.string().min(1, "Last name is required").max(50).nullable(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  boatingExperience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional().nullable(),
  profileImage: z.union([
    z.string().url("Invalid URL format"),
    z.string().length(0), // Allow empty string
    z.null(), // Allow null
  ]).optional().nullable(),
  coverImage: z.union([
    z.string().url("Invalid URL format"),
    z.string().length(0), // Allow empty string
    z.null(), // Allow null
  ]).optional().nullable(),
});

/**
 * Simplified Booking Schema using Pricing Tiers
 * Users select from exact pricing tiers instead of arbitrary hours
 */
export const bookingRequestSchema = z.object({

    // Core booking data
  // startDate and startTime are removed.
  // We now expect startDateTime as a string (ISO 8601 with timezone)
  startDateTime: z.string({ required_error: "Start date and time are required" })
    .datetime({ message: "Invalid date and time format" }), // Zod's .datetime() validates ISO 8601 strings

  // You might also need endDateTime, depending on your UI/business logic.
  // If endDateTime is derived from pricingTierId + startDateTime on the backend,
  // then you might not need it here directly.
  // If your UI allows custom end times, you would add:
  // endDateTime: z.string().datetime({ message: "Invalid end date and time format" }).optional(),


  pricingTierId: z.string().min(1, "Please select a duration option"),
  numberOfPassengers: z.number().min(1, "At least one passenger is required"),
  needsCaptain: z.boolean(),
  specialRequests: z.string().optional(),
});

// Export type for use in components
export type BookingRequest = z.infer<typeof bookingRequestSchema>;
export type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type PhoneVerificationData = z.infer<typeof phoneVerificationSchema>;


