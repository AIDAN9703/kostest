import { z } from "zod";

/**
 * Authentication Schemas
 */
export const signUpSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3, "Last name must be at least 3 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
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
 * Booking Request Schema
 * Handles both single-day and multi-day bookings
 */
export const bookingRequestSchema = z.object({
  // Basic booking details
  isMultiDay: z.boolean(),
  numberOfPassengers: z.number().min(1, "At least one passenger is required"),
  needsCaptain: z.boolean(),
  specialRequests: z.string().optional(),
  
  // Date and time
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  numberOfHours: z.number().min(1, "Number of hours is required").optional(),
}).superRefine((data, ctx) => {
  // Time validation
  const [startHour, startMinute] = data.startTime.split(":").map(Number);
  const [endHour, endMinute] = data.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Ensure end time is after start time
  if (endMinutes <= startMinutes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["endTime"],
    });
  }

  // Multi-day booking validations
  if (data.isMultiDay) {
    if (!data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required for multi-day bookings",
        path: ["endDate"],
      });
    } else if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }
  } 
  // Single-day booking validations
  else {
    if (!data.numberOfHours) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Number of hours is required for single-day bookings",
        path: ["numberOfHours"],
      });
    }
  }
});

// Export type for use in components
export type BookingRequest = z.infer<typeof bookingRequestSchema>;
export type ProfileFormValues = z.infer<typeof profileUpdateSchema>;
