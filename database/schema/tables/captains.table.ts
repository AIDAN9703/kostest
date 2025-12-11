import { pgTable, text, integer, boolean, doublePrecision, uuid, timestamp, index, geometry, json } from "drizzle-orm/pg-core";
import { users } from "@/database/schema/tables";




export const captains = pgTable("captain", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "restrict" }), // Can't delete user if is captain
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
    licenseExpiry: timestamp("license_expiry", { mode: "date", withTimezone: true }),
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
    agreementDate: timestamp("agreement_date", { mode: "date", withTimezone: true }),
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