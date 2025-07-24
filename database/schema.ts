import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  json,
  pgEnum,
  primaryKey,
  date,
  index,
  PgArray,
  uuid,
  geometry,
  unique,
} from "drizzle-orm/pg-core";
// Verification related enums
export const verificationTypeEnum = pgEnum("VerificationType", [
  "PHONE",
  "EMAIL",
  "IDENTITY",
  "AGE",
  "PAYMENT_METHOD",
]);

export const verificationStatusEnum = pgEnum("VerificationStatus", [
  "PENDING",
  "PASSED",
  "FAILED",
  "EXPIRED",
]);

// Add new verification channel enum
export const verificationChannelEnum = pgEnum("VerificationChannel", [
  "SMS",
  "CALL",
  "EMAIL",
  "WHATSAPP",
]);

// User related enums
export const userRoleEnum = pgEnum("UserRole", [
  "USER", 
  "ADMIN", 
  "CAPTAIN", 
  "BROKER",
  "OWNER"  // Adding OWNER as a distinct role
]);

export const userStatusEnum = pgEnum("UserStatus", [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
  "BANNED"
]);

export const authProviderEnum = pgEnum("AuthProvider", [
  "EMAIL",
  "GOOGLE",
  "FACEBOOK",
  "APPLE"
]);

export const notificationPreferenceEnum = pgEnum("NotificationPreference", [
  "ALL",
  "IMPORTANT_ONLY",
  "NONE"
]);

export const boatingExperienceLevelEnum = pgEnum("BoatingExperienceLevel", [
  "NONE",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
  "PROFESSIONAL"
]);

// Blog/News related enums
export const postStatusEnum = pgEnum("PostStatus", [
  "DRAFT",
  "PUBLISHED", 
  "ARCHIVED",
  "SCHEDULED"
]);

// Messaging system enums
export const conversationTypeEnum = pgEnum("ConversationType", [
  "BOOKING",      // Conversation related to a specific booking
  "GENERAL",      // General inquiry or communication
  "SUPPORT",      // Customer support conversation
  "ADMIN"         // Admin-initiated conversation
]);

export const conversationStatusEnum = pgEnum("ConversationStatus", [
  "ACTIVE",       // Ongoing conversation
  "ARCHIVED",     // Conversation archived by user
  "CLOSED",       // Conversation closed (no further messages)
  "SYSTEM_CLOSED" // System-closed (e.g., booking completed)
]);

export const messageTypeEnum = pgEnum("MessageType", [
  "TEXT",         // Regular text message
  "IMAGE",        // Image attachment
  "DOCUMENT",     // Document attachment
  "SYSTEM",       // System-generated message
  "BOOKING_UPDATE", // Booking status update
  "PAYMENT_UPDATE"  // Payment status update
]);

export const messageStatusEnum = pgEnum("MessageStatus", [
  "SENT",         // Message sent successfully
  "DELIVERED",    // Message delivered to recipient(s)
  "READ",         // Message read by recipient(s)
  "FAILED"        // Message failed to send
]);

export const postCategoryEnum = pgEnum("PostCategory", [
  "FLEET_NEWS",
  "CONSERVATION", 
  "TIPS_ADVICE",
  "CASE_STUDY",
  "COMPANY_NEWS",
  "SAFETY",
  "EVENTS"
]);


export const boatCategoryEnum = pgEnum("BoatCategory", [
  "PONTOON",
  "YACHT",
  "SAILBOAT",
  "FISHING",
  "SPEEDBOAT",
  "HOUSEBOAT",
  "JET_SKI",
  "OTHER"
]);

// New consolidated booking type enum
export const bookingTypeEnum = pgEnum("BookingType", [
  "DAY_REQUEST",         // Standard booking request that needs approval
  "INSTANT_BOOK",    // Instant booking (no approval needed)
  "TERM_CHARTER",
  "MULTI_DAY",
  "EXTERNAL_BOOKING"
]);

// New consolidated booking status enum
export const bookingStatusEnum = pgEnum("BookingStatus", [
  "PENDING",         // Initial state for booking requests
  "APPROVED",        // Request approved, waiting for payment
  "AWAITING_PAYMENT", // Payment link sent, waiting for payment
  "CONFIRMED",       // Payment received, booking confirmed
  "DENIED",          // Request was denied
  "EXPIRED",         // Payment wasn't made within timeframe
  "CANCELLED",       // Cancelled by customer or owner
  "COMPLETED",       // Trip completed
  "REFUNDED"         // Booking was refunded
]);

// Optional: Keep if you need to itemize charges
export const lineItemTypeEnum = pgEnum("LineItemType", [
  "CLEANING",
  "CAPTAIN",
  "VESSEL_FEE",
  "BOOKING_FEE",
  "TAX",
  "TRANSACTION_FEE",
  "OTHER"
]);

// Location related types
export const locationTypeEnum = pgEnum("LocationType", [
  "HOME_PORT",
  "CURRENT_LOCATION",
  "PICKUP_LOCATION",
  "DROPOFF_LOCATION",
  "DESTINATION",
]);

export const paymentStatusEnum = pgEnum("PaymentStatus", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "CHARGEBACK",
]);

// Add after the existing enums and before the tables
export const boatPricingTiers = pgTable("boat_pricing_tier", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  boatId: uuid("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  
  // Pricing Details
  hours: integer("hours").notNull(),
  price: doublePrecision("price").notNull(),
  name: text("name"), // Optional name for the tier (e.g., "Half Day", "Full Day")
  description: text("description"), // Optional description
  isActive: boolean("is_active").default(true).notNull(),
  isDefault: boolean("is_default").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    index("boat_pricing_boat_idx").on(table.boatId),
    index("boat_pricing_hours_idx").on(table.hours),
    // Enforce uniqueness of hours per boat instead of a plain index
    unique("boat_pricing_unique_idx").on(table.boatId, table.hours)
  ]
});

// Tables
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
    
    // Boating Qualifications
    boatingExperience: boatingExperienceLevelEnum("boating_experience").default("NONE"),
    boatingLicenseNumber: text("boating_license_number"),
    boatingLicenseExpiry: timestamp("boating_license_expiry", { mode: "date" }),
    boatingLicenseVerified: boolean("boating_license_verified").default(false),
    
    
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
    index("boating_exp_idx").on(table.boatingExperience),
    // Search-specific indexes
    index("user_search_name_idx").on(table.firstName, table.lastName),
    index("user_search_username_idx").on(table.username),
  ]
);

export const captains = pgTable("captain", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  status: text("status").default("PENDING"),
  
  // Personal Information
  description: text("description"),
  hireRate: doublePrecision("hire_rate"),
  availableForHire: boolean("available_for_hire").default(false),
  
  // Location
  street: text("street"),
  streetSecond: text("street_second"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  
  // Licensing & Qualifications
  uscgLicensed: boolean("uscg_licensed").default(false).notNull(),
  licenseType: text("license_type"),
  licenseNumber: text("license_number"),
  licenseExpiry: timestamp("license_expiry", { mode: "date" }),
  licenseImage: text("license_image"),
  yearsExperience: integer("years_experience"),
  
  // Professional Details
  specialties: text("specialties").array(),
  languages: text("languages").array(),
  certifications: text("certifications").array(),
  resume: text("resume"),
  
  // Availability & Preferences
  availability: json("availability"),
  preferredBoatTypes: text("preferred_boat_types").array(),
  preferredLocations: text("preferred_locations").array(),
  maxPassengers: integer("max_passengers"),
  
  
  // Agreement Information
  agreementSigned: boolean("agreement_signed").default(false),
  agreementDate: timestamp("agreement_date", { mode: "date" }),
  agreementType: text("agreement_type"),
  
  // Reviews & Ratings
  totalTrips: integer("total_trips").default(0),
  averageRating: doublePrecision("average_rating"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("captain_status_idx").on(table.status),
  index("captain_location_idx").on(table.city, table.state),
  index("captain_license_idx").on(table.licenseType)
]);

export const boats = pgTable("boat",{
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    name: text("name").notNull(),
    displayTitle: text("display_title"),
    description: text("description"),
    category: boatCategoryEnum("category").notNull(),
    capacity: integer("capacity").notNull(), // Renamed from numOfPassengers
    active: boolean("active").default(false).notNull(),
    featured: boolean("featured").default(false),
    featuredOrder: integer("featured_order"), // Order for featured fleet display (lower = higher priority)
    searchRankingScore: doublePrecision("search_ranking_score").default(0), // For advanced search algorithms
    
    // Owner Information
    ownerId: uuid("owner_id").notNull().references(() => users.id),
    ownerNotes: text("owner_notes"), // Added owner notes for internal use
    
    // Boat Specifications
    make: text("make"),
    model: text("model"),
    yearBuilt: integer("year_built"),
    lengthFt: integer("length_ft").notNull(),
    bathrooms: integer("bathrooms"),         // Renamed from numOfBathrooms
    showers: integer("showers"),             // Renamed from numOfShowers
    sleeps: integer("sleeps"),               // Renamed from sleepsNum
    range: integer("range"),                 // Nautical miles at cruising speed
    
    // Features
    features: text("features").array().notNull(),
    safetyEquipment: text("safety_equipment").array(), // Added safety equipment
    
    // Media
    mainImage: text("main_image"),           // Renamed from primaryPhoto
    galleryImages: text("gallery_images").array(), // Renamed from galleryPhotos
    virtualTourUrl: text("virtual_tour_url"),
    
    // Pricing (all pricing now driven by tiers; weekly/monthly remain optional)
    weeklyRate: doublePrecision("weekly_rate"),
    monthlyRate: doublePrecision("monthly_rate"),
    depositAmount: doublePrecision("deposit_amount"),
    cleaningFee: doublePrecision("cleaning_fee"), // Added cleaning fee
    
    // Location
    locationLabel: text("location_label"), // Human-readable label for the geo point
    location: geometry('location', { type: 'point', srid: 4326 }),
    availableDestinations: text("available_destinations").array(),
    dockInfo: text("dock_info"),
    parkingInfo: text("parking_info"),        // Renamed from parkingNotes
    
    // Charter Options
    crewRequired: boolean("crew_required").default(true).notNull(),
    crewIncluded: boolean("crew_included").default(true).notNull(),
    primaryCaptainId: uuid("primary_captain_id").references(() => captains.id),
    dayCharter: boolean("day_charter").default(true).notNull(),
    termCharter: boolean("term_charter").default(false).notNull(),
    minimumCharterDays: integer("minimum_charter_days"),
    
    // Booking Options
    instantBook: boolean("instant_book").default(false).notNull(),
    
    // Fuel Details
    fuelIncluded: boolean("fuel_included").default(false).notNull(),
    
    // Rules & Instructions
    rules: text("rules"),                     // Renamed from instructionsAndRules
    specialInstructions: text("special_instructions"),
    cancellationPolicy: text("cancellation_policy"), // Added cancellation policy
    
    // Documentation
    registrationNumber: text("registration_number"),
    hullId: text("hull_id"),
    insuranceInfo: text("insurance_info"),    // Simplified insurance fields
    insuranceExpiry: timestamp("insurance_expiry", { mode: "date" }),
    
    // Availability
    minRentalHours: integer("min_rental_hours"), // Added minimum rental hours
    maxRentalDays: integer("max_rental_days"),   // Added maximum rental days
    advanceBookingDays: integer("advance_booking_days"), // Added advance booking days
    
    // Maintenance
    lastMaintenanceDate: timestamp("last_maintenance_date", { mode: "date" }),
    nextMaintenanceDate: timestamp("next_maintenance_date", { mode: "date" }),
    maintenanceNotes: text("maintenance_notes"), // Added maintenance notes

    averageRating: doublePrecision("average_rating"),
    totalReviews: integer("total_reviews").default(0),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("boat_owner_idx").on(table.ownerId),
    index("boat_captain_idx").on(table.primaryCaptainId),
    index("boat_category_idx").on(table.category),
    index("boat_spatial_idx").using("gist", table.location),
    index("boat_featured_idx").on(table.featured, table.featuredOrder), // For featured fleet queries
    index("boat_ranking_idx").on(table.searchRankingScore), // For search ranking queries
    // Search-specific indexes
    index("boat_search_name_idx").on(table.name),
    index("boat_search_make_model_idx").on(table.make, table.model),
  ]
);

// Consolidated bookings table that replaces both bookingRequests and bookings
export const bookings = pgTable("booking", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  bookingType: bookingTypeEnum("booking_type").default("EXTERNAL_BOOKING").notNull(),
  bookingStatus: bookingStatusEnum("booking_status").default("PENDING").notNull(),
  
  // User Information
  userId: uuid("user_id").references(() => users.id), // Renamed from renterId, optional for non-logged in requests
  boatId: uuid("boat_id").notNull().references(() => boats.id),
  captainId: uuid("captain_id").references(() => captains.id),
  pricingTierId: uuid("pricing_tier_id").references(() => boatPricingTiers.id),
  
  // Customer Information (needed even when userId exists)
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  
  // Booking Configuration
  isMultiDay: boolean("is_multi_day").notNull(),
  needsCaptain: boolean("needs_captain").default(false),
  
  // Dates and Times (simplified for day rentals)
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }), // Nullable for single-day bookings
  startTime: text("start_time").notNull(), // Store as HH:mm in 24h format
  endTime: text("end_time").notNull(), // Store as HH:mm in 24h format
  numberOfPassengers: integer("number_of_passengers").notNull(),
  
  // Location Details
  pickupLocation: text("pickup_location"),
  dropoffLocation: text("dropoff_location"),
  
  // Pricing
  captainFee: doublePrecision("captain_fee"),
  cleaningFee: doublePrecision("cleaning_fee"),
  serviceFee: doublePrecision("service_fee"),
  taxAmount: doublePrecision("tax_amount"),
  totalAmount: doublePrecision("total_amount").notNull(),
  depositAmount: doublePrecision("deposit_amount"),
  currency: text("currency").default("USD").notNull(),
  
  // Payment Information
  paymentStatus: paymentStatusEnum("payment_status").default("PENDING"),
  paymentMethod: text("payment_method"),
  paymentDueDate: timestamp("payment_due_date", { mode: "date" }),
  depositPaid: boolean("deposit_paid").default(false),
  refundAmount: doublePrecision("refund_amount"),
  refundStatus: text("refund_status"),
  
  // Stripe Integration
  stripeCustomerId: text("stripe_customer_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripePaymentLinkId: text("stripe_payment_link_id"),
  
  // Special Requests & Add-ons
  specialRequests: text("special_requests"),
  occasionType: text("occasion_type"),
  addOns: json("add_ons"),
  
  // Status Management (keep minimal admin fields)
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  reviewNotes: text("review_notes"),
  
  // Cancellation
  cancelledAt: timestamp("cancelled_at", { mode: "date", withTimezone: true }),
  cancellationReason: text("cancellation_reason"),
  cancelledBy: uuid("cancelled_by").references(() => users.id),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }), // When a request or payment link expires
}, (table) => [
  // Indexes for common queries
  index("booking_type_idx").on(table.bookingType),
  index("booking_status_idx").on(table.bookingStatus),
  index("booking_user_idx").on(table.userId),
  index("booking_boat_idx").on(table.boatId),
  index("booking_captain_idx").on(table.captainId),
  index("booking_date_idx").on(table.startDate, table.endDate),
  // Search-specific indexes
  index("booking_search_customer_idx").on(table.customerName, table.customerEmail),
]);

export const reviews = pgTable("review", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  type: text("type").notNull(), // BOAT, CAPTAIN, RENTER
  status: text("status").default("PUBLISHED").notNull(),
  
  // Relationships
  bookingId: uuid("booking_id").references(() => bookings.id),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id),
  reviewedUserId: uuid("reviewed_user_id").references(() => users.id),
  reviewedBoatId: uuid("reviewed_boat_id").references(() => boats.id),
  reviewedCaptainId: uuid("reviewed_captain_id").references(() => captains.id),
  
  // Review Content
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content"),
  response: text("response"),
  responseDate: timestamp("response_date", { mode: "date", withTimezone: true }),
  
  // Media
  photos: text("photos").array(),
  
  // Flags
  isVerified: boolean("is_verified").default(false),
  isFeatured: boolean("is_featured").default(false),
  isReported: boolean("is_reported").default(false),
  reportReason: text("report_reason"),
  
  // Metrics
  helpfulCount: integer("helpful_count").default(0),
  unhelpfulCount: integer("unhelpful_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("review_type_idx").on(table.type),
  index("review_booking_idx").on(table.bookingId),
  index("review_reviewer_idx").on(table.reviewerId),
  index("review_boat_idx").on(table.reviewedBoatId),
  index("review_captain_idx").on(table.reviewedCaptainId),
  index("review_user_idx").on(table.reviewedUserId)
]);

// Add new verifications table after the existing tables
export const verifications = pgTable("verification", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Verification Details
  type: verificationTypeEnum("type").notNull(),
  channel: verificationChannelEnum("channel").notNull(),
  status: verificationStatusEnum("status").default("PENDING").notNull(),
  
  // Contact Information
  phoneNumber: text("phone_number"),
  email: text("email"),
  
  // Verification Code
  code: text("code").notNull(),
  codeHash: text("code_hash"), // For additional security
  
  // Twilio Information
  twilioSid: text("twilio_sid"), // Twilio verification SID
  twilioStatus: text("twilio_status"), // Status from Twilio API
  
  // Attempt Tracking
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  
  // Timing
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  verifiedAt: timestamp("verified_at", { mode: "date", withTimezone: true }),
  
  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: json("metadata"), // For storing additional context (e.g., booking ID for booking-related verifications)
}, (table) => [
  index("verification_user_idx").on(table.userId),
  index("verification_status_idx").on(table.status),
  index("verification_type_idx").on(table.type),
  index("verification_expires_idx").on(table.expiresAt),
]);

// Add new notifications table for future messaging needs
export const notifications = pgTable("notification", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Notification Content
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(), // e.g., BOOKING_CONFIRMATION, BOOKING_REQUEST, VERIFICATION, etc.
  
  // Delivery Information
  channel: text("channel").notNull(), // SMS, EMAIL, PUSH, IN_APP
  status: text("status").default("PENDING").notNull(), // PENDING, SENT, DELIVERED, FAILED
  
  // Twilio Information (for SMS/WhatsApp)
  twilioSid: text("twilio_sid"),
  twilioStatus: text("twilio_status"),
  
  // Related Records
  relatedId: uuid("related_id"), // e.g., bookingId, verificationId
  relatedType: text("related_type"), // e.g., BOOKING, VERIFICATION
  
  // Timing
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  sentAt: timestamp("sent_at", { mode: "date", withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { mode: "date", withTimezone: true }),
  readAt: timestamp("read_at", { mode: "date", withTimezone: true }),
  
  // Metadata
  metadata: json("metadata"),
}, (table) => [
  index("notification_user_idx").on(table.userId),
  index("notification_status_idx").on(table.status),
  index("notification_type_idx").on(table.type),
  index("notification_related_idx").on(table.relatedId, table.relatedType),
]);

// Add generalInquiries table for handling general booking inquiries
export const generalInquiries = pgTable("general_inquiry", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  status: text("status").default("PENDING").notNull(), // PENDING, CONTACTED, RESOLVED, ARCHIVED
  
  // Customer Information
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  
  // Inquiry Details
  date: timestamp("date", { mode: "date" }),
  time: text("time"),
  budget: text("budget"),
  guests: integer("guests"),
  message: text("message"),
  
  // Admin fields
  assignedTo: uuid("assigned_to").references(() => users.id),
  notes: text("notes"),
  termsAccepted: boolean("terms_accepted").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  contactedAt: timestamp("contacted_at", { mode: "date", withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { mode: "date", withTimezone: true }),
}, (table) => [
  index("inquiry_status_idx").on(table.status),
  index("inquiry_email_idx").on(table.email),
  index("inquiry_date_idx").on(table.createdAt),
]);

// Blog posts table for news/blog content management
export const blogPosts = pgTable("blog_post", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  
  // Content
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(), // SEO-friendly URL
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(), // Rich text/HTML content
  
  // Meta
  status: postStatusEnum("status").default("DRAFT").notNull(),
  category: postCategoryEnum("category").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  
  // Media
  featuredImage: text("featured_image"),
  imageAlt: text("image_alt"),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  
  // Author & Publishing
  author: text("author").notNull().default("KOS Team"),
  publishedAt: timestamp("published_at", { mode: "date", withTimezone: true }),
  scheduledFor: timestamp("scheduled_for", { mode: "date", withTimezone: true }),
  
  // Engagement (optional for future)
  viewCount: integer("view_count").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("blog_post_status_idx").on(table.status),
  index("blog_post_category_idx").on(table.category),
  index("blog_post_featured_idx").on(table.isFeatured),
  index("blog_post_published_idx").on(table.publishedAt),
  index("blog_post_author_idx").on(table.author),
  index("blog_post_slug_idx").on(table.slug),
  index("blog_post_created_idx").on(table.createdAt),
]);

// Messaging System Tables

// Conversations table - represents a conversation between users about a booking or general topic
export const conversations = pgTable("conversation", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  type: conversationTypeEnum("type").default("BOOKING").notNull(),
  status: conversationStatusEnum("status").default("ACTIVE").notNull(),
  
  // Relationships
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }), // Optional - null for general conversations
  initiatedBy: uuid("initiated_by").notNull().references(() => users.id), // User who started the conversation
  
  // Participants - stored as array for flexibility
  participantIds: uuid("participant_ids").array().notNull(), // Array of user IDs in this conversation
  
  // Conversation Metadata
  subject: text("subject"), // Optional subject/title for the conversation
  lastMessageId: uuid("last_message_id"), // Reference to most recent message (set after messages table)
  lastMessageAt: timestamp("last_message_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  
  // Message Counts
  messageCount: integer("message_count").default(0).notNull(),
  unreadCount: integer("unread_count").default(0).notNull(), // Total unread messages across all participants
  
  // Conversation Settings
  isLocked: boolean("is_locked").default(false).notNull(), // Prevent new messages (admin only)
  autoCloseAt: timestamp("auto_close_at", { mode: "date", withTimezone: true }), // Auto-close conversation after booking completion
  
  // Admin Management
  assignedAdmin: uuid("assigned_admin").references(() => users.id), // Admin assigned to handle this conversation
  priority: text("priority").default("NORMAL").notNull(), // HIGH, NORMAL, LOW
  tags: text("tags").array(), // Tags for categorization
  
  // Privacy & Visibility
  isArchived: boolean("is_archived").default(false).notNull(),
  archivedBy: uuid("archived_by").references(() => users.id),
  archivedAt: timestamp("archived_at", { mode: "date", withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // Primary indexes for common queries
  index("conversation_booking_idx").on(table.bookingId),
  index("conversation_participants_idx").using("gin", table.participantIds), // GIN index for array queries
  index("conversation_status_idx").on(table.status),
  index("conversation_type_idx").on(table.type),
  
  // Indexes for message ordering and pagination
  index("conversation_last_message_idx").on(table.lastMessageAt),
  index("conversation_last_activity_idx").on(table.lastActivityAt),
  
  // Admin management indexes
  index("conversation_assigned_admin_idx").on(table.assignedAdmin),
  index("conversation_priority_idx").on(table.priority),
  
  // Search and filtering indexes
  index("conversation_tags_idx").using("gin", table.tags), // GIN index for tag searches
  index("conversation_created_idx").on(table.createdAt),
]);


// Messages table - individual messages within conversations
export const messages = pgTable("message", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  
  // Message Content
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").default("TEXT").notNull(),
  
  // Attachments
  attachments: json("attachments"), // Array of attachment objects with URL, type, name, size
  
  // Message Status & Delivery
  status: messageStatusEnum("status").default("SENT").notNull(),
  
  // Read Tracking - JSON object with userId: timestamp pairs
  readBy: json("read_by").default("{}").notNull(), // {"userId": "2024-01-01T00:00:00.000Z", ...}
  readCount: integer("read_count").default(0).notNull(), // Denormalized count for performance
  
  
  // Message Metadata
  isEdited: boolean("is_edited").default(false).notNull(),
  editedAt: timestamp("edited_at", { mode: "date", withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  deletedBy: uuid("deleted_by").references(() => users.id),
  
  // System Message Data
  systemMessageData: json("system_message_data"), // For system messages - booking updates, status changes, etc.
  
  // Moderation
  isFlagged: boolean("is_flagged").default(false).notNull(),
  flagReason: text("flag_reason"),
  flaggedBy: uuid("flagged_by").references(() => users.id),
  flaggedAt: timestamp("flagged_at", { mode: "date", withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),

 
}, (table) => [
  // Primary indexes for message retrieval
  index("message_conversation_idx").on(table.conversationId),
  index("message_sender_idx").on(table.senderId),
  
  // Indexes for message ordering and pagination
  index("message_conversation_created_idx").on(table.conversationId, table.createdAt),
  index("message_conversation_updated_idx").on(table.conversationId, table.updatedAt),
  
  // Status and type filtering
  index("message_status_idx").on(table.status),
  index("message_type_idx").on(table.messageType),
  
  
  
  // Moderation indexes
  index("message_flagged_idx").on(table.isFlagged),
  index("message_deleted_idx").on(table.isDeleted),
  
  // Search indexes
  index("message_created_idx").on(table.createdAt),
]);

// Conversation Participants table - explicit many-to-many relationship for better query performance
export const conversationParticipants = pgTable("conversation_participant", {
  // Core Relationship
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Participant Status
  status: text("status").default("ACTIVE").notNull(), // ACTIVE, LEFT, REMOVED, MUTED
  role: text("role").default("PARTICIPANT").notNull(), // PARTICIPANT, MODERATOR, ADMIN
  
  // Personalization
  isArchived: boolean("is_archived").default(false).notNull(), // User archived this conversation
  isMuted: boolean("is_muted").default(false).notNull(), // User muted notifications
  customName: text("custom_name"), // User's custom name for this conversation
  
  // Read Status
  lastReadAt: timestamp("last_read_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  lastReadMessageId: uuid("last_read_message_id"), // Last message this user read
  unreadCount: integer("unread_count").default(0).notNull(), // Unread messages for this user
  
  // Notification Preferences
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  smsNotifications: boolean("sms_notifications").default(false).notNull(),
  
  // Timestamps
  joinedAt: timestamp("joined_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  leftAt: timestamp("left_at", { mode: "date", withTimezone: true }),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // Unique constraint - each user can only be in a conversation once
  unique("conversation_participant_unique").on(table.conversationId, table.userId),
  
  // Primary indexes for participant queries
  index("conversation_participant_conversation_idx").on(table.conversationId),
  index("conversation_participant_user_idx").on(table.userId),
  
  // Status and filtering indexes
  index("conversation_participant_status_idx").on(table.status),
  index("conversation_participant_archived_idx").on(table.isArchived),
  index("conversation_participant_muted_idx").on(table.isMuted),
  
  // Read status indexes for unread counts
  index("conversation_participant_unread_idx").on(table.userId, table.unreadCount),
  index("conversation_participant_last_read_idx").on(table.lastReadAt),
  
  // Timestamps
  index("conversation_participant_joined_idx").on(table.joinedAt),
]);