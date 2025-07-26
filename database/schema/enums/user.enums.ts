import { pgEnum } from "drizzle-orm/pg-core";

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