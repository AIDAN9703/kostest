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
} from "drizzle-orm/pg-core";

export const lineItemTypeEnum = pgEnum("LineItemType", [
  "CLEANING",
  "CAPTAIN",
  "OWNER",
  "BOOKING_FEE",
]);

export const bookingStatusEnum = pgEnum("BookingStatus", [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

export const paymentStatusEnum = pgEnum("PaymentStatus", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

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

export const userRoleEnum = pgEnum("UserRole", ["USER", "ADMIN", "CAPTAIN", "BROKER"]);

// Add new boat-related enums
export const boatStatusEnum = pgEnum("BoatStatus", [
  "PENDING",
  "ACTIVE",
  "INACTIVE",
  "MAINTENANCE",
  "ARCHIVED",
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

// Order of tables has been arranged to satisfy foreign-key dependencies.

// 1. User
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  birthday: timestamp("birthday", { mode: "date" }),
  profileAbsPath: text("profile_abs_path"),
  status: text("status").default('active'),
  
  // New security fields
  lastLoginAt: timestamp("last_login_at", { mode: "date", withTimezone: true }),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLockedUntil: timestamp("account_locked_until", { mode: "date", withTimezone: true }),
  
  // New role/type field
  role: userRoleEnum("role").default("USER").notNull(),
  
  // New preferences
  language: text("language").default("en"),
  timezone: text("timezone").default("UTC"),
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true).notNull(),
  
  // Basic verification flags
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneConfirmed: boolean("phone_confirmed").default(false).notNull(),
  
  // Password reset (important for security)
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires", { mode: "date" }),
  
  // Important flags
  signupComplete: boolean("signup_complete").default(false).notNull(),
  acceptedAnchorCode: boolean("accepted_anchor_code").default(false).notNull(),
  
  // Soft delete
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),

  // Terms and Marketing
  termsAcceptedAt: timestamp("terms_accepted_at", { mode: "date", withTimezone: true }),
  marketingEmailsEnabled: boolean("marketing_emails_enabled").default(true).notNull(),
  privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at", { mode: "date", withTimezone: true }),

  // Account verification (additional)
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),

  // Session management
  lastActiveAt: timestamp("last_active_at", { mode: "date", withTimezone: true }),
  forcePasswordChange: boolean("force_password_change").default(false).notNull(),
});

// 2.--------------------------------------------Captain-------------------------------------------------------------
export const captains = pgTable("captain", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  status: text("status"),
  uscgLicensed: boolean("uscg_licensed").default(false).notNull(),
  uscgLicenseNumber: text("uscg_license_number"),
  licenseExpDate: text("license_exp_date"),
  licenseType: text("license_type"),
  description: text("description"),
  hireRate: doublePrecision("hire_rate"),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  street: text("street"),
  streetSecond: text("street_second"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  captainForHire: boolean("captain_for_hire"),
  anchorAcademy: boolean("anchor_academy"),
  listBoat: boolean("list_boat"),
  previousExperience: text("previous_experience"),
  resumeUrl: text("resume_url"),
  licenseUrl: text("license_url"),
  licenseKey: json("license_key"),
  primaryCrewId: uuid("primary_crew_id"),
  icaSignature: text("ica_signature"),
  icaType: text("ica_type"),
  icaDate: timestamp("ica_date", { mode: "date" }),
  academyQualified: boolean("academy_qualified"),
  academyStatusId: integer("academy_status_id"),
  drugInfoId: integer("drug_info_id"),
  personalInfoId: integer("personal_info_id"),
  availability: json("availability"),
  preferredVessels: json("preferred_vessels"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

// 3. Boat
export const boats = pgTable(
  "boat",
  {
    // Primary Key
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    
    // Owner information
    ownerId: uuid("owner_id").notNull().references(() => users.id),
    ownerEmail: text("owner_email"),
    
    // Basic boat info
    name: text("name").notNull(),
    displayTitle: text("display_title"),
    category: boatCategoryEnum("category").notNull(),
    make: text("make"),
    model: text("model"),
    yearBuilt: integer("year_built"),
    lengthFt: integer("length_ft").notNull(),
    
    // Specifications
    numOfPassengers: integer("num_of_passengers").notNull(),
    numOfCabins: integer("num_of_cabins"),
    numOfBathrooms: integer("num_of_bathrooms"),
    numOfShowers: integer("num_of_showers"),
    sleepsNum: integer("sleeps_num"),
    beam: doublePrecision("beam"), // Width of the yacht
    draft: doublePrecision("draft"), // Depth below waterline
    grossTonnage: integer("gross_tonnage"),
    cruisingSpeed: integer("cruising_speed"),
    maxSpeed: integer("max_speed"),
    range: integer("range"), // Nautical miles at cruising speed
    
    // Features and descriptions
    description: text("description"),
    features: text("features").array().notNull(),
    specialInstructions: text("special_instructions"),
    parkingNotes: text("parking_notes"),
    instructionsAndRules: text("instructions_and_rules"),
    dockInfo: text("dock_info"),
    notes: text("notes"),
    
    // Enhanced media
    primaryPhoto: text("primary_photo"),
    primaryPhotoAbsPath: text("primary_photo_abs_path"),
    galleryPhotos: text("gallery_photos").array(),
    virtualTourUrl: text("virtual_tour_url"),
    youtubeLink: text("youtube_link"),
    
    // Enhanced pricing
    hourlyRate: doublePrecision("hourly_rate").notNull(),
    halfDayPrice: doublePrecision("half_day_price"),
    fullDayPrice: doublePrecision("full_day_price"),
    weeklyRate: doublePrecision("weekly_rate"),
    monthlyRate: doublePrecision("monthly_rate"),
    seasonalRates: json("seasonal_rates"), // JSON object with seasonal pricing
    additionalHours: doublePrecision("additional_hours"),
    depositAmount: doublePrecision("deposit_amount"),
    cashValue: doublePrecision("cash_value"),
    
    // Location and availability
    homePort: text("home_port"),
    currentLocation: text("current_location"),
    availableDestinations: text("available_destinations").array(),
    seasonalLocations: json("seasonal_locations"), // JSON object with seasonal locations
    
    // Status and visibility
    status: boatStatusEnum("status").default("PENDING").notNull(),
    active: boolean("active").default(false).notNull(),
    featured: boolean("featured").default(false),
    featuredOrder: integer("featured_order"),
    listBoat: boolean("list_boat").default(false).notNull(),
    
    // Enhanced crew information
    crewRequired: boolean("crew_required").default(true).notNull(),
    crewIncluded: boolean("crew_included").default(true).notNull(),
    crewNum: integer("crew_num"),
    primaryCaptainId: uuid("primary_captain_id").references(() => captains.id),
    
    // Charter options
    dayCharter: boolean("day_charter").default(true).notNull(),
    termCharter: boolean("term_charter").default(true).notNull(),
    minimumCharterDays: integer("minimum_charter_days"),
    preferredCharterDuration: text("preferred_charter_duration"),
    
    // Enhanced fuel and technical details
    fuelIncluded: boolean("fuel_included").default(false).notNull(),
    fuelBillingRate: doublePrecision("fuel_billing_rate"),
    fuelReimbursementRate: doublePrecision("fuel_reimbursement_rate"),
    fuelPayeeType: text("fuel_payee_type"),
    fuelCapacity: integer("fuel_capacity"),
    waterCapacity: integer("water_capacity"),
    
    // Documentation and certification
    hullId: text("hull_id"),
    registrationNumber: text("registration_number"),
    flagState: text("flag_state"),
    classificationSociety: text("classification_society"),
    insurancePhoto: text("insurance_photo"),
    insurancePhotoAbsPath: text("insurance_photo_abs_path"),
    insuranceExpiryDate: timestamp("insurance_expiry_date", { mode: "date" }),
    lastSurveyDate: timestamp("last_survey_date", { mode: "date" }),
    
    // Timestamps and metadata
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    lastMaintenanceDate: timestamp("last_maintenance_date", { mode: "date" }),
    nextMaintenanceDate: timestamp("next_maintenance_date", { mode: "date" })
  },
  (table) => [
    index("boat_owner_idx").on(table.ownerId),
    index("boat_captain_idx").on(table.primaryCaptainId),
    index("boat_status_idx").on(table.status),
    index("boat_category_idx").on(table.category)
  ]
);

/* // 4. MooringLocation
export const mooringLocations = pgTable("mooring_location", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  boatId: uuid("boat_id").notNull().unique().references(() => boats.id),
  
  // Location details
  address: text("address").notNull(),
  lat: doublePrecision("lat"),
  long: doublePrecision("long"),
  mooringAddressComponents: json("mooring_address_components"),
  
  // Parking information
  parkingAddress: text("parking_address"),
  parkingLat: doublePrecision("parking_lat"),
  parkingLong: doublePrecision("parking_long"),
  parkingAddressComponents: json("parking_address_components"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

// 5. BoatImage
export const boatImages = pgTable("boat_image", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  boatId: uuid("boat_id").notNull().references(() => boats.id),
  
  // Image details
  url: text("url").notNull(),
  resourceKey: text("resource_key"),
  thumbUrl: text("thumb_url"),
  thumbKey: text("thumb_key"),
  sortOrder: integer("sort_order"),
  
  // Processing flags
  needsCrop: boolean("needs_crop").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

// 6. BoatRate
export const boatRates = pgTable("boat_rate", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  boatId: uuid("boat_id").notNull().references(() => boats.id),
  
  // Rate details
  name: text("name").notNull(),
  rateType: text("rate_type").notNull(),
  ratePayee: text("rate_payee"),
  
  // Pricing
  hourlyRate: doublePrecision("hourly_rate"),
  halfDayRate: doublePrecision("half_day_rate"),
  fullDayRate: doublePrecision("full_day_rate"),
  customRate: doublePrecision("custom_rate"),
  
  // Calculations
  taxPercentage: doublePrecision("tax_percentage"),
  markupPercentage: doublePrecision("markup_percentage"),
  percentageBasedRatePercent: doublePrecision("percentage_based_rate_percent"),
  percentBasedOn: text("percent_based_on"),
  
  // Payout settings
  generatePayouts: boolean("generate_payouts").default(true).notNull(),
  payToUserId: uuid("pay_to_user_id").references(() => users.id),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

// 7. BoatCaptainMap (formerly VesselCaptainMap)
export const boatCaptainMap = pgTable(
  "boat_captain_map",
  {
    boatId: uuid("boat_id").notNull().references(() => boats.id),
    captainId: uuid("captain_id").notNull().references(() => captains.id),
  },
  (table) => ({
    pk: primaryKey(table.boatId, table.captainId),
  })
);

// 8. BoatWaterBodyMap (formerly VesselWaterBodyMap)
export const boatWaterBodyMap = pgTable(
  "boat_water_body_map",
  {
    boatId: uuid("boat_id").notNull().references(() => boats.id),
    waterBodyId: uuid("water_body_id").notNull().references(() => waterBodies.id),
    featuredBoat: boolean("featured_boat").default(false).notNull(),
  },
  (table) => ({
    pk: primaryKey(table.boatId, table.waterBodyId),
  })
);

// 9. ProductOffering
export const productOfferings = pgTable("product_offering", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id),
  duration: integer("duration").notNull(),
  openAvailability: boolean("open_availability").default(true).notNull(),
  availabilityStartTime: text("availability_start_time").notNull(),
  availabilityEndTime: text("availability_end_time").notNull(),
  discount: doublePrecision("discount").default(0).notNull(),
  premium: doublePrecision("premium").default(0).notNull(),
  advanceNoticeMinHours: integer("advance_notice_min_hours")
    .default(3)
    .notNull(),
  hoursBetween: integer("hours_between").default(1).notNull(),
  customAvailabilityTimes: json("custom_availability_times"),
  price: doublePrecision("price"),
  fromCalendarPref: boolean("from_calendar_pref").default(false).notNull(),
  selectableTimes: text("selectable_times").array().notNull(),
  requiredAddOns: json("required_add_ons"),
  optionalAddOns: json("optional_add_ons"),
  monday: boolean("monday").default(true).notNull(),
  tuesday: boolean("tuesday").default(true).notNull(),
  wednesday: boolean("wednesday").default(true).notNull(),
  thursday: boolean("thursday").default(true).notNull(),
  friday: boolean("friday").default(true).notNull(),
  saturday: boolean("saturday").default(true).notNull(),
  sunday: boolean("sunday").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// 10. LineItem
export const lineItems = pgTable("line_item", {
  id: serial("id").primaryKey(),
  productOfferingId: integer("product_offering_id")
    .notNull()
    .references(() => productOfferings.id),
  name: lineItemTypeEnum("name").notNull(),
  price: doublePrecision("price").notNull(),
  estimatedTax: doublePrecision("estimated_tax").default(0).notNull(),
  originalPrice: doublePrecision("original_price").notNull(),
});

// 11. BoatUnavailability
export const boatUnavailabilities = pgTable(
  "boat_unavailability",
  {
    id: serial("id").primaryKey(),
    boatId: integer("boat_id").notNull().references(() => boats.id),
    startTime: timestamp("start_time", { mode: "date" }).notNull(),
    endTime: timestamp("end_time", { mode: "date" }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    index_boat_time: index("boat_unavailability_index").on(
      table.boatId,
      table.startTime,
      table.endTime,
    ),
  })
);

// 12. Buyflow
export const buyflows = pgTable("buyflow", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id),
  productOfferingId: integer("product_offering_id")
    .notNull()
    .references(() => productOfferings.id),
  status: text("status").notNull(),
  step: integer("step").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  userVerified: boolean("user_verified").default(false).notNull(),
  userVerifiedAt: timestamp("user_verified_at", { mode: "date" }),
  verificationNotes: text("verification_notes"),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  identityVerified: boolean("identity_verified").default(false).notNull(),
  requirePhoneVerification: boolean("require_phone_verification")
    .default(true)
    .notNull(),
  requireEmailVerification: boolean("require_email_verification")
    .default(true)
    .notNull(),
  requireIdentityVerification: boolean("require_identity_verification")
    .default(true)
    .notNull(),
});

// 13. BuyflowItem
export const buyflowItems = pgTable("buyflow_item", {
  id: serial("id").primaryKey(),
  buyflowId: integer("buyflow_id").notNull().references(() => buyflows.id),
  itemType: text("item_type").notNull(),
  amount: doublePrecision("amount").notNull(),
  required: boolean("required").default(true).notNull(),
  selected: boolean("selected").default(false).notNull(),
});

// 14. Booking
export const bookings = pgTable(
  "booking",
  {
    id: serial("id").primaryKey(),
    boatId: integer("boat_id").notNull().references(() => boats.id),
    userId: integer("user_id").notNull().references(() => users.id),
    captainId: integer("captain_id").references(() => captains.id),
    buyflowId: integer("buyflow_id").notNull().unique().references(() => buyflows.id),
    status: bookingStatusEnum("status").notNull(),
    startTime: timestamp("start_time", { mode: "date" }).notNull(),
    endTime: timestamp("end_time", { mode: "date" }).notNull(),
    totalAmount: doublePrecision("total_amount").notNull(),
    depositPaid: boolean("deposit_paid").default(false).notNull(),
    depositAmount: doublePrecision("deposit_amount"),
    specialRequests: text("special_requests"),
    apiToken: text("api_token"),
    apiResponse: json("api_response"),
    apiStatus: text("api_status"),
    apiErrorMessage: text("api_error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    booking_index: index("booking_index").on(
      table.boatId,
      table.startTime,
      table.endTime,
    ),
  })
);

// 15. Payment
export const payments = pgTable("payment", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  amount: doublePrecision("amount").notNull(),
  status: paymentStatusEnum("status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// 16. UserVerificationCheck
export const userVerificationChecks = pgTable("user_verification_check", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  buyflowId: integer("buyflow_id").notNull().references(() => buyflows.id),
  verificationType: verificationTypeEnum("verification_type").notNull(),
  status: verificationStatusEnum("status").notNull(),
  attemptedAt: timestamp("attempted_at", { mode: "date" }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
  failureReason: text("failure_reason"),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
});

// 17. UsernameHistory
export const usernameHistories = pgTable( "username_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    oldUsername: text("old_username").notNull(),
    newUsername: text("new_username").notNull(),
    changedAt: timestamp("changed_at", { mode: "date" }).defaultNow().notNull(),
    reason: text("reason"),
  },
  (table) => ({
    user_changed_idx: index("username_history_userid_changedat_idx").on(
      table.userId,
      table.changedAt,
    ),
  })
);

// ========================================================
// New Tables and Enums for Additional Functionality
// ========================================================

// Support Ticket Status Enum
export const supportTicketStatusEnum = pgEnum("SupportTicketStatus", [
  "OPEN",
  "IN_PROGRESS",
  "CLOSED",
  "ON_HOLD",
]);

// Water Body Table - to capture details about a water body (e.g., bay, lake, strait)
export const waterBodies = pgTable("water_body", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  lat: doublePrecision("lat"),
  long: doublePrecision("long"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Employee Table - for internal staff/employee portal and admin functions
export const employees = pgTable("employee", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  role: text("role").notNull(),  // e.g., "ADMIN", "SUPPORT", "MANAGER"
  department: text("department"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Support Ticket Table - allowing customers to file support queries
export const supportTickets = pgTable("support_ticket", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: supportTicketStatusEnum("status").default("OPEN").notNull(),
  assignedEmployeeId: integer("assigned_employee_id").references(() => employees.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Notification Table - for sending alerts/messages to users (or employees)
export const notifications = pgTable("notification", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type"), // e.g., "SYSTEM", "PROMOTION", etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Boat Review Table - to allow users to leave reviews about boats
export const boatReviews = pgTable("boat_review", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // e.g., 1-5 scale
  comment: text("comment"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Admin Log Table - to track actions performed by employees on the admin portal
export const adminLogs = pgTable("admin_log", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  action: text("action").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
*/