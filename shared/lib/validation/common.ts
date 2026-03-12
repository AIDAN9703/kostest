import * as z from "zod";

const PHONE_REGEX = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

/**
 * Password validation schema
 * 
 * Requirements:
 * - Minimum 8 characters
 * - Maximum 100 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * Used for: User sign-up, admin user creation, password updates
 */
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Simple password schema for sign-in (only checks minimum length)
 * Used when password is already validated (e.g., sign-in forms)
 */
export const passwordSignInSchema = z.string()
  .min(8, "Password must be at least 8 characters");

/**
 * Phone number validation schema
 * 
 * Accepts common formats:
 * - 555-123-4567
 * - (555) 123-4567
 * - +1-555-123-4567
 * - 5551234567
 * 
 * Used for: User profiles, contact forms, booking inquiries
 */
export const phoneSchema = z.string()
  .regex(
    PHONE_REGEX,
    "Please enter a valid phone number (e.g., 555-123-4567)"
  )
  .optional()
  .nullable();

/**
 * Required phone number schema (for forms where phone is mandatory)
 */
export const phoneRequiredSchema = z.string()
  .regex(
    PHONE_REGEX,
    "Please enter a valid phone number (e.g., 555-123-4567)"
  )
  .min(10, "Phone number must be at least 10 characters");

/**
 * Email validation schema
 * 
 * Uses Zod's built-in email validation (RFC 5322 compliant)
 * No need for custom regex - Zod's validation is sufficient
 * 
 * Used for: User accounts, contact forms, booking inquiries
 */
export const emailSchema = z.string()
  .email("Please enter a valid email address");
