import { pgTable, text, integer, boolean, uuid, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/tables";
import { captainStatusEnum } from "@/database/schema/enums";

/**
 * Captain Profiles - Profile extension for users who are captains
 * 
 * Key design decisions:
 * - userId IS the primary key (not a separate id) - this is a profile extension pattern
 * - References users.id directly - no indirection
 * - Used for internal fleet management (admin assigns captains to bookings)
 */
export const captainProfiles = pgTable("captain_profile", {
  // Primary key IS the user ID (profile extension pattern)
  userId: uuid("user_id").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),

  // Status for admin management
  status: captainStatusEnum("status").default("PENDING").notNull(),

  // Contact (for admin to reach them quickly)
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),

  // Location (for assignment proximity)
  city: text("city"),
  state: text("state"),
  zip: text("zip"),

  // Licensing & Compliance (REQUIRED for captains)
  uscgLicensed: boolean("uscg_licensed").default(false).notNull(),
  licenseType: text("license_type"),
  licenseNumber: text("license_number"),
  licenseExpiry: timestamp("license_expiry", { mode: "date", withTimezone: true }),
  licenseImageUrl: text("license_image_url"),

  // Professional Info
  yearsExperience: integer("years_experience"),
  certifications: text("certifications").array(),  // CPR, First Aid, etc.
  specialties: text("specialties").array(),        // Fishing, sailing, yacht handling
  languages: text("languages").array(),
  bio: text("bio"),                                // Captain-specific bio

  // Capabilities (helps admin assign appropriately)
  maxPassengers: integer("max_passengers"),        // What size boats they can handle
  preferredBoatTypes: text("preferred_boat_types").array(),

  // Availability preferences (helps admin with scheduling)
  availability: jsonb("availability"),             // Weekly availability schedule

  // Agreement & Compliance
  agreementSigned: boolean("agreement_signed").default(false),
  agreementSignedAt: timestamp("agreement_signed_at", { mode: "date", withTimezone: true }),

  // Admin notes (internal use only)
  adminNotes: text("admin_notes"),

  // Verification tracking
  verifiedAt: timestamp("verified_at", { mode: "date", withTimezone: true }),
  verifiedByUserId: uuid("verified_by_user_id").references(() => users.id, { onDelete: "set null" }),

  // Metrics (updated by system)
  totalTripsCompleted: integer("total_trips_completed").default(0),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("captain_profile_status_idx").on(table.status),
  index("captain_profile_location_idx").on(table.city, table.state),
  index("captain_profile_license_expiry_idx").on(table.licenseExpiry),
]);
