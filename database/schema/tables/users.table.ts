import { pgTable, text, integer, boolean, doublePrecision, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { userStatusEnum, userRoleEnum, notificationPreferenceEnum, authProviderEnum } from "@/database/schema/enums";



export const users = pgTable(
    "user", 
    {
      // Core Identity
      id: uuid("id").defaultRandom().notNull().primaryKey(),
      email: text("email").notNull().unique(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      status: userStatusEnum("status").default("ACTIVE").notNull(),
      role: userRoleEnum("role").default("USER").notNull(),
      
      // Personal Information
      firstName: text("first_name"),
      lastName: text("last_name"),
      displayName: text("display_name"),
      phoneNumber: text("phone_number"),
      birthday: timestamp("birthday", { mode: "date" }),
      bio: text("bio"),
      
      // Profile Media
      profileImage: text("profile_image"),
      coverImage: text("cover_image"),
      
      // Authentication & Security
      emailVerified: boolean("email_verified").default(false).notNull(),
      phoneVerified: boolean("phone_verified").default(false).notNull(),
      twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
      twoFactorSecret: text("two_factor_secret"),
      authProvider: authProviderEnum("auth_provider").default("EMAIL"),
      providerAccountId: text("provider_account_id"),
      
      // Login Information
      lastLoginAt: timestamp("last_login_at", { mode: "date", withTimezone: true }),
      failedLoginAttempts: integer("failed_login_attempts").default(0),
      accountLockedUntil: timestamp("account_locked_until", { mode: "date", withTimezone: true }),
      
      // Password Management
      passwordChangedAt: timestamp("password_changed_at", { mode: "date", withTimezone: true }),
      resetPasswordToken: text("reset_password_token"),
      resetPasswordExpires: timestamp("reset_password_expires", { mode: "date" }),
      forcePasswordChange: boolean("force_password_change").default(false).notNull(),
      
      
      // Notification Preferences
      emailNotifications: notificationPreferenceEnum("email_notifications").default("ALL"),
      smsNotifications: notificationPreferenceEnum("sms_notifications").default("IMPORTANT_ONLY"),
      marketingEmailsEnabled: boolean("marketing_emails_enabled").default(true).notNull(),
      
      // Location Information
      country: text("country"),
      state: text("state"),
      city: text("city"),
      address: text("address"),
      postalCode: text("postal_code"),
      
      // Verification & Compliance
      identityVerified: boolean("identity_verified").default(false),
      governmentIdVerified: boolean("government_id_verified").default(false),
      governmentIdType: text("government_id_type"),
      
      // Insurance Information
      hasInsurance: boolean("has_insurance").default(false),
      insuranceProvider: text("insurance_provider"),
      insurancePolicyNumber: text("insurance_policy_number"),
      insuranceExpiryDate: timestamp("insurance_expiry_date", { mode: "date" }),
      insuranceVerified: boolean("insurance_verified").default(false),
      
      // Payment Information
      stripeCustomerId: text("stripe_customer_id"),
      defaultPaymentMethodId: text("default_payment_method_id"),
      hasBankAccountConnected: boolean("has_bank_account_connected").default(false),
      stripeConnectAccountId: text("stripe_connect_account_id"),
      payoutPreference: text("payout_preference").default("AUTOMATIC"),
      
      // Owner/Renter Specific
      isBoatOwner: boolean("is_boat_owner").default(false),
      ownerOnboardingComplete: boolean("owner_onboarding_complete").default(false),
      totalBoatsListed: integer("total_boats_listed").default(0),
      preferredRentalTypes: text("preferred_rental_types").array(),
      
      
      // Terms & Agreements
      termsAcceptedAt: timestamp("terms_accepted_at", { mode: "date", withTimezone: true }),
      privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at", { mode: "date", withTimezone: true }),
  
      
      // Activity Metrics
      totalBookings: integer("total_bookings").default(0),
      totalReviews: integer("total_reviews").default(0),
      averageRating: doublePrecision("average_rating"),
      cancellationRate: doublePrecision("cancellation_rate").default(0),
      responseRate: doublePrecision("response_rate").default(0),
      responseTime: integer("response_time"), // Average response time in minutes
      
      // Timestamps
      createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
      updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
      index("email_idx").on(table.email),
      index("status_idx").on(table.status),
      index("role_idx").on(table.role),
      // Search-specific indexes
      index("user_search_name_idx").on(table.firstName, table.lastName),
      index("user_search_username_idx").on(table.username),
    ]
  );