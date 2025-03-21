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
} from "drizzle-orm/pg-core";

// Payment related enums
export const paymentStatusEnum = pgEnum("PaymentStatus", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

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

export const boatingLicenseTypeEnum = pgEnum("BoatingLicenseType", [
  "NONE",
  "STATE_BOATING_LICENSE",
  "USCG_LICENSE",
  "INTERNATIONAL_LICENSE",
  "OTHER"
]);

export const boatCategoryEnum = pgEnum("BoatCategory", [
  "PONTOON",
  "YACHT",
  "SAILBOAT",
  "FISHING",
  "SPEEDBOAT",
  "HOUSEBOAT",
  "JET_SKI",
  "OTHER",
]);

// Booking related enums
export const bookingRequestStatusEnum = pgEnum("BookingRequestStatus", [
  "PENDING",           // Just submitted, waiting for KOS team review
  "APPROVED",         // KOS team approved, waiting for customer payment
  "AWAITING",        // Payment link sent, waiting for payment
  "CONFIRMED",       // Payment received, booking confirmed
  "DENIED",          // KOS team denied the request
  "EXPIRED",         // Payment wasn't made within 24 hours
  "CANCELLED"        // Cancelled by customer or KOS team
]);

// Optional: Keep if you need to itemize charges
export const lineItemTypeEnum = pgEnum("LineItemType", [
  "CLEANING",
  "CAPTAIN",
  "OWNER",
  "BOOKING_FEE",
]);

// Location related types
export const locationTypeEnum = pgEnum("LocationType", [
  "HOME_PORT",
  "CURRENT_LOCATION",
  "PICKUP_LOCATION",
  "DROPOFF_LOCATION",
  "DESTINATION",
]);

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
    lastLoginIp: text("last_login_ip"),
    lastLoginDevice: text("last_login_device"),
    failedLoginAttempts: integer("failed_login_attempts").default(0),
    accountLockedUntil: timestamp("account_locked_until", { mode: "date", withTimezone: true }),
    
    // Password Management
    passwordChangedAt: timestamp("password_changed_at", { mode: "date", withTimezone: true }),
    resetPasswordToken: text("reset_password_token"),
    resetPasswordExpires: timestamp("reset_password_expires", { mode: "date" }),
    forcePasswordChange: boolean("force_password_change").default(false).notNull(),
    
    // User Preferences
    language: text("language").default("en"),
    timezone: text("timezone").default("UTC"),
    currency: text("currency").default("USD"),
    theme: text("theme").default("light"),
    
    // Notification Preferences
    emailNotifications: notificationPreferenceEnum("email_notifications").default("ALL"),
    pushNotifications: notificationPreferenceEnum("push_notifications").default("ALL"),
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
    verificationToken: text("verification_token"),
    verificationTokenExpires: timestamp("verification_token_expires", { mode: "date" }),
    governmentIdVerified: boolean("government_id_verified").default(false),
    governmentIdType: text("government_id_type"),
    governmentIdExpiry: timestamp("government_id_expiry", { mode: "date" }),
    backgroundCheckStatus: text("background_check_status"),
    backgroundCheckDate: timestamp("background_check_date", { mode: "date" }),
    
    // Boating Qualifications
    boatingExperience: boatingExperienceLevelEnum("boating_experience").default("NONE"),
    boatingLicenseType: boatingLicenseTypeEnum("boating_license_type").default("NONE"),
    boatingLicenseNumber: text("boating_license_number"),
    boatingLicenseExpiry: timestamp("boating_license_expiry", { mode: "date" }),
    boatingLicenseVerified: boolean("boating_license_verified").default(false),
    boatingCertifications: text("boating_certifications").array(),
    
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
    ownerVerificationStatus: text("owner_verification_status"),
    totalBoatsListed: integer("total_boats_listed").default(0),
    preferredRentalTypes: text("preferred_rental_types").array(),
    
    // Renter Preferences
    preferredBoatTypes: text("preferred_boat_types").array(),
    preferredDestinations: text("preferred_destinations").array(),
    rentalHistory: json("rental_history"),
    
    // Terms & Agreements
    termsAcceptedAt: timestamp("terms_accepted_at", { mode: "date", withTimezone: true }),
    privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at", { mode: "date", withTimezone: true }),
    acceptedAnchorCode: boolean("accepted_anchor_code").default(false).notNull(),
    rentalAgreementAcceptedAt: timestamp("rental_agreement_accepted_at", { mode: "date", withTimezone: true }),
    liabilityWaiverAcceptedAt: timestamp("liability_waiver_accepted_at", { mode: "date", withTimezone: true }),
    
    // Onboarding & Progress
    signupComplete: boolean("signup_complete").default(false).notNull(),
    onboardingStep: integer("onboarding_step").default(1),
    profileCompletionPercentage: integer("profile_completion_percentage").default(0),
    
    // Activity Metrics
    lastActiveAt: timestamp("last_active_at", { mode: "date", withTimezone: true }),
    totalBookings: integer("total_bookings").default(0),
    totalReviews: integer("total_reviews").default(0),
    averageRating: doublePrecision("average_rating"),
    totalTripsAsRenter: integer("total_trips_as_renter").default(0),
    totalTripsAsOwner: integer("total_trips_as_owner").default(0),
    cancellationRate: doublePrecision("cancellation_rate").default(0),
    responseRate: doublePrecision("response_rate").default(0),
    responseTime: integer("response_time"), // Average response time in minutes
    
    // Referral Program
    referralCode: text("referral_code"),
    referredById: uuid("referred_by_id"), // Store just the ID without foreign key constraint
    totalReferrals: integer("total_referrals").default(0),
    referralCredits: doublePrecision("referral_credits").default(0),
    
    // Soft Delete
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
    deletionReason: text("deletion_reason"),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("email_idx").on(table.email),
    index("status_idx").on(table.status),
    index("role_idx").on(table.role),
    index("boating_exp_idx").on(table.boatingExperience),
    index("referral_code_idx").on(table.referralCode),
    index("referred_by_idx").on(table.referredById)
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
  
  // Academy & Training
  academyQualified: boolean("academy_qualified").default(false),
  academyStatus: text("academy_status"),
  trainingCompleted: text("training_completed").array(),
  
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

export const boats = pgTable(
  "boat",
  {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    name: text("name").notNull(),
    displayTitle: text("display_title"),
    description: text("description"),
    category: boatCategoryEnum("category").notNull(),
    active: boolean("active").default(false).notNull(),
    featured: boolean("featured").default(false),
    featuredOrder: integer("featured_order"),
    
    // Owner Information
    ownerId: uuid("owner_id").notNull().references(() => users.id),
    ownerEmail: text("owner_email"),
    
    // Boat Specifications
    make: text("make"),
    model: text("model"),
    yearBuilt: integer("year_built"),
    lengthFt: integer("length_ft").notNull(),
    capacity: integer("capacity").notNull(), // Renamed from numOfPassengers
    cabins: integer("cabins"),               // Renamed from numOfCabins
    bathrooms: integer("bathrooms"),         // Renamed from numOfBathrooms
    showers: integer("showers"),             // Renamed from numOfShowers
    sleeps: integer("sleeps"),               // Renamed from sleepsNum
    beam: doublePrecision("beam"),           // Width of the boat
    draft: doublePrecision("draft"),         // Depth below waterline
    weight: integer("weight"),               // Added weight (in tons)
    fuelType: text("fuel_type"),             // Added fuel type
    engineType: text("engine_type"),         // Added engine type
    enginePower: text("engine_power"),       // Added engine power
    maxSpeed: integer("max_speed"),
    cruisingSpeed: integer("cruising_speed"),
    range: integer("range"),                 // Nautical miles at cruising speed
    
    // Features
    features: text("features").array().notNull(),
    amenities: text("amenities").array(),    // Added amenities
    safetyEquipment: text("safety_equipment").array(), // Added safety equipment
    
    // Media
    mainImage: text("main_image"),           // Renamed from primaryPhoto
    galleryImages: text("gallery_images").array(), // Renamed from galleryPhotos
    virtualTourUrl: text("virtual_tour_url"),
    videoUrl: text("video_url"),             // Renamed from youtubeLink
    
    // Pricing
    hourlyRate: doublePrecision("hourly_rate").notNull(),
    halfDayPrice: doublePrecision("half_day_price"),
    fullDayPrice: doublePrecision("full_day_price"),
    weeklyRate: doublePrecision("weekly_rate"),
    monthlyRate: doublePrecision("monthly_rate"),
    depositAmount: doublePrecision("deposit_amount"),
    cleaningFee: doublePrecision("cleaning_fee"), // Added cleaning fee
    taxRate: doublePrecision("tax_rate"),     // Added tax rate
    seasonalRates: json("seasonal_rates"),    // JSON object with seasonal pricing
    
    // Location
    homePort: text("home_port"),
    currentLocation: text("current_location"),
    location: geometry('location', { type: 'point', srid: 4326 }),
    availableDestinations: text("available_destinations").array(),
    dockInfo: text("dock_info"),
    parkingInfo: text("parking_info"),        // Renamed from parkingNotes
    
    // Charter Options
    crewRequired: boolean("crew_required").default(true).notNull(),
    crewIncluded: boolean("crew_included").default(true).notNull(),
    crewSize: integer("crew_size"),           // Renamed from crewNum
    primaryCaptainId: uuid("primary_captain_id").references(() => captains.id),
    dayCharter: boolean("day_charter").default(true).notNull(),
    termCharter: boolean("term_charter").default(false).notNull(),
    minimumCharterDays: integer("minimum_charter_days"),
    
    // Fuel Details
    fuelIncluded: boolean("fuel_included").default(false).notNull(),
    fuelCapacity: integer("fuel_capacity"),
    waterCapacity: integer("water_capacity"),
    
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
    availableWeekdays: text("available_weekdays").array(), // Added available days
    minRentalHours: integer("min_rental_hours"), // Added minimum rental hours
    maxRentalDays: integer("max_rental_days"),   // Added maximum rental days
    advanceBookingDays: integer("advance_booking_days"), // Added advance booking days
    seasonalAvailability: json("seasonal_availability"), // Added seasonal availability
    
    // Maintenance
    lastMaintenanceDate: timestamp("last_maintenance_date", { mode: "date" }),
    nextMaintenanceDate: timestamp("next_maintenance_date", { mode: "date" }),
    maintenanceNotes: text("maintenance_notes"), // Added maintenance notes
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("boat_owner_idx").on(table.ownerId),
    index("boat_captain_idx").on(table.primaryCaptainId),
    index("boat_category_idx").on(table.category),
    index("boat_location_idx").on(table.homePort),
    index("boat_spatial_idx").using("gist", table.location),
  ]
);

export const bookingRequests = pgTable("booking_requests", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  
  // Boat and User Info
  boatId: uuid("boat_id").notNull().references(() => boats.id),
  userId: uuid("user_id").references(() => users.id), // Optional, in case user is not logged in
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  
  // Booking Type
  isMultiDay: boolean("is_multi_day").notNull(),
  
  // Dates and Times
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }), // Nullable for single-day bookings
  startTime: text("start_time").notNull(), // Store as HH:mm in 24h format
  endTime: text("end_time").notNull(), // Store as HH:mm in 24h format
  numberOfHours: integer("number_of_hours"), // Only for single-day bookings
  
  // Other Details
  numberOfPassengers: integer("number_of_passengers").notNull(),
  specialRequests: text("special_requests"),
  occasionType: text("occasion_type"),
  needsCaptain: boolean("needs_captain").default(false),
  
  // Pricing
  totalAmount: doublePrecision("total_amount").notNull(),
  depositAmount: doublePrecision("deposit_amount"),
  currency: text("currency").default("USD").notNull(),
  paymentDueDate: timestamp("payment_due_date", { mode: "date" }),
  
  // Status Management
  status: bookingRequestStatusEnum("status").default("PENDING").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  reviewNotes: text("review_notes"),
  
  // Stripe Integration
  stripePaymentLinkId: text("stripe_payment_link_id"),
  stripePaymentLinkUrl: text("stripe_payment_link_url"),
  stripePaymentLinkExpiresAt: timestamp("stripe_payment_link_expires_at", { mode: "date" }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }), // 24 hours after approval
  
  // Soft delete
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
}, (table) => [
  // Indexes for common queries
  index("booking_requests_boat_id_idx").on(table.boatId),
  index("booking_requests_user_id_idx").on(table.userId),
  index("booking_requests_status_idx").on(table.status),
  index("booking_requests_date_range_idx").on(table.startDate, table.endDate)
]);

export const bookings = pgTable("booking", {
  // Core Information
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  status: text("status").default("PENDING").notNull(),
  type: text("type").notNull(),
  
  // Relationships
  renterId: uuid("renter_id").notNull().references(() => users.id),
  boatId: uuid("boat_id").notNull().references(() => boats.id),
  captainId: uuid("captain_id").references(() => captains.id),
  
  // Booking Details
  startDate: timestamp("start_date", { mode: "date", withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { mode: "date", withTimezone: true }).notNull(),
  duration: integer("duration").notNull(),
  passengers: integer("passengers").notNull(),
  
  // Location
  pickupLocation: text("pickup_location"),
  pickupCoordinates: geometry('pickup_coordinates', { type: 'point', srid: 4326 }),
  dropoffLocation: text("dropoff_location"),
  dropoffCoordinates: geometry('dropoff_coordinates', { type: 'point', srid: 4326 }),
  destinationDetails: text("destination_details"),
  
  // Pricing
  basePrice: doublePrecision("base_price").notNull(),
  captainFee: doublePrecision("captain_fee"),
  cleaningFee: doublePrecision("cleaning_fee"),
  serviceFee: doublePrecision("service_fee").notNull(),
  taxAmount: doublePrecision("tax_amount"),
  totalPrice: doublePrecision("total_price").notNull(),
  
  // Payment
  paymentStatus: text("payment_status").default("PENDING"),
  paymentMethod: text("payment_method"),
  paymentIntentId: text("payment_intent_id"),
  depositAmount: doublePrecision("deposit_amount"),
  depositPaid: boolean("deposit_paid").default(false),
  refundAmount: doublePrecision("refund_amount"),
  
  // Special Requests
  specialRequests: text("special_requests"),
  addOns: json("add_ons"),
  
  // Cancellation
  cancelledAt: timestamp("cancelled_at", { mode: "date", withTimezone: true }),
  cancellationReason: text("cancellation_reason"),
  cancelledBy: uuid("cancelled_by").references(() => users.id),
  refundStatus: text("refund_status"),
  
  // Communication
  messageThreadId: uuid("message_thread_id"),
  lastMessageAt: timestamp("last_message_at", { mode: "date", withTimezone: true }),
  
  // Reviews
  renterReviewId: uuid("renter_review_id"),
  ownerReviewId: uuid("owner_review_id"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("booking_status_idx").on(table.status),
  index("booking_renter_idx").on(table.renterId),
  index("booking_boat_idx").on(table.boatId),
  index("booking_date_idx").on(table.startDate, table.endDate),
  index("booking_pickup_idx").using("gist", table.pickupCoordinates),
  index("booking_dropoff_idx").using("gist", table.dropoffCoordinates),
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