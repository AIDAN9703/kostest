import { pgEnum } from "drizzle-orm/pg-core";

// User related enums
// REMOVED: userRoleEnum - replaced with isAdmin boolean flag

export const userStatusEnum = pgEnum("UserStatus", [
  "ACTIVE",
  "PENDING_VERIFICATION",
  "INACTIVE",
  "SUSPENDED",
]);

// Captain profile status
export const captainStatusEnum = pgEnum("CaptainStatus", [
  "PENDING",           // Awaiting verification
  "ACTIVE",            // Verified and available for assignment
  "INACTIVE",          // Temporarily unavailable
  "ON_LEAVE",          // Extended absence
  "SUSPENDED",         // Admin suspended
]);

// Owner profile business type
export const ownerBusinessTypeEnum = pgEnum("OwnerBusinessType", [
  "INDIVIDUAL",        // Personal boat owner
  "COMPANY",           // Charter company or LLC
]);