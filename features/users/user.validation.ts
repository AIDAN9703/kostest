import * as z from "zod";
import { 
  userRoleEnum, 
  userStatusEnum, 
  authProviderEnum
} from "@/database/schema";

// Email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone number regex - accepts common formats with optional country code
const PHONE_REGEX = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// Password regex requiring at least one uppercase letter and one special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// Common user schema for shared fields between create and update
const userBaseSchema = z.object({
  // Personal Information
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  displayName: z.string().optional().nullable(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
  profileImage: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  
  // Account Information
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string()
    .email("Please enter a valid email address")
    .regex(EMAIL_REGEX, "Please enter a valid email address"),
  phoneNumber: z.string()
    .regex(PHONE_REGEX, "Please enter a valid phone number (e.g., 555-123-4567)")
    .optional()
    .nullable(),
  role: z.enum(userRoleEnum.enumValues),
  status: z.enum(userStatusEnum.enumValues),
  twoFactorEnabled: z.boolean().default(false),
  authProvider: z.enum(authProviderEnum.enumValues).default("EMAIL").optional(),
  
  // Contact Information
  address: z.string().max(100, "Address must be less than 100 characters").optional().nullable(),
  city: z.string().max(50, "City must be less than 50 characters").optional().nullable(),
  state: z.string().max(50, "State must be less than 50 characters").optional().nullable(),
  postalCode: z.string()
    .regex(/^[0-9a-zA-Z\s-]{3,10}$/, "Please enter a valid postal/zip code")
    .optional()
    .nullable(),
  country: z.string().max(50, "Country must be less than 50 characters").optional().nullable(),
  
  // Verification Status
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  identityVerified: z.boolean().default(false),
  governmentIdVerified: z.boolean().default(false),
  
  // Stripe Information
  stripeCustomerId: z.string().optional().nullable(),
  stripeConnectAccountId: z.string().optional().nullable(),
  hasBankAccountConnected: z.boolean().default(false).optional().nullable(),
  
  // Other settings that might be needed for admin
  marketingEmailsEnabled: z.boolean().default(true).optional(),
  isDeleted: z.boolean().default(false).optional(),
});

// Create user schema (requires password)
export const createUserSchema = userBaseSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter and one special character"
    ),
});

// Update user schema (password is optional)
export const updateUserSchema = userBaseSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter and one special character"
    )
    .optional(),
});

// User search/filter schema
export const userFilterSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  role: z.enum(userRoleEnum.enumValues).optional(),
  status: z.enum(userStatusEnum.enumValues).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
