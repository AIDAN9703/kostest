import { pgEnum } from "drizzle-orm/pg-core";

export const postCategoryEnum = pgEnum("PostCategory", [
    "FLEET_NEWS",
    "CONSERVATION", 
    "TIPS_ADVICE",
    "CASE_STUDY",
    "COMPANY_NEWS",
    "SAFETY",
    "EVENTS"
  ]);


  // Blog/News related enums
export const postStatusEnum = pgEnum("PostStatus", [
    "DRAFT",
    "PUBLISHED", 
    "ARCHIVED",
    "SCHEDULED"
  ]);
  