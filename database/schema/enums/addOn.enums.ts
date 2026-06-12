import { pgEnum } from "drizzle-orm/pg-core";

/** Categories for the add-on catalog (used for grouping/filtering in admin). */
export const addOnCategoryEnum = pgEnum("AddOnCategory", [
  "FOOD_BEVERAGE",
  "WATER_TOYS",
  "FISHING",
  "GEAR",
  "SERVICES",
  "OTHER",
]);
