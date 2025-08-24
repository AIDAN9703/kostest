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

  // Timezone enum - Major IANA timezone identifiers
export const timezoneEnum = pgEnum('timezone', [
  // Major US Timezones
  'America/New_York',      // Eastern Time (ET) - covers Pittsburgh, Miami, Connecticut, etc.
  'America/Chicago',       // Central Time (CT) - covers Great Lakes, Texas Gulf, etc.
  'America/Denver',        // Mountain Time (MT) - covers Colorado, Utah, etc.
  'America/Los_Angeles',   // Pacific Time (PT) - covers California, Oregon, Washington
  'America/Phoenix',       // Arizona (no DST)
  'America/Anchorage',     // Alaska Time (AKT)
  'Pacific/Honolulu',      // Hawaii-Aleutian Time (HAT)
  
  // Caribbean & Popular International
  'America/Nassau',        // Bahamas
  'America/Jamaica',       // Jamaica  
  'America/Santo_Domingo', // Dominican Republic
  'America/Barbados',      // Eastern Caribbean
  'America/Cancun',        // Mexico Caribbean coast
  
  // Canada Major Zones
  'America/Toronto',       // Eastern Canada
  'America/Vancouver',     // Pacific Canada
]);