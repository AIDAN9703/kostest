import { pgEnum } from "drizzle-orm/pg-core";



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

  // Location related types
export const locationTypeEnum = pgEnum("LocationType", [
    "HOME_PORT",
    "CURRENT_LOCATION",
    "PICKUP_LOCATION",
    "DROPOFF_LOCATION",
    "DESTINATION",
  ]);

  export const boatingExperienceLevelEnum = pgEnum("BoatingExperienceLevel", [
    "NONE",
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
    "PROFESSIONAL"
  ]);