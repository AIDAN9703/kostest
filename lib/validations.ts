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
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
