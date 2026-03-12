import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { postStatusEnum, postCategoryEnum } from "@/database/schema/enums";




export const blogPosts = pgTable("blog_post", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    
    // Content
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(), // SEO-friendly URL
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(), // Rich text/HTML content
    
    // Meta
    status: postStatusEnum("status").default("DRAFT").notNull(),
    category: postCategoryEnum("category").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    
    // Media
    featuredImage: text("featured_image"),
    imageAlt: text("image_alt"),
    
    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    
    // Author & Publishing
    author: text("author").notNull().default("KOS Team"),
    publishedAt: timestamp("published_at", { mode: "date", withTimezone: true }),
    scheduledFor: timestamp("scheduled_for", { mode: "date", withTimezone: true }),
    
    // Engagement (optional for future)
    viewCount: integer("view_count").default(0).notNull(),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  }, (table) => [
    index("blog_post_status_idx").on(table.status),
    index("blog_post_category_idx").on(table.category),
    index("blog_post_featured_idx").on(table.isFeatured),
    index("blog_post_published_idx").on(table.publishedAt),
    index("blog_post_author_idx").on(table.author),
    index("blog_post_slug_idx").on(table.slug),
    index("blog_post_created_idx").on(table.createdAt),
  ]);
  