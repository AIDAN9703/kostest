/**
 * Blog Types
 * Types for admin blog list and detail views.
 * Aligned with database schema and BlogPost for form compatibility.
 */

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
export type BlogCategory =
  | "FLEET_NEWS"
  | "CONSERVATION"
  | "TIPS_ADVICE"
  | "CASE_STUDY"
  | "COMPANY_NEWS"
  | "SAFETY"
  | "EVENTS";

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: BlogStatus;
  category: BlogCategory;
  isFeatured: boolean;
  featuredImage: string | null;
  imageAlt: string | null;
  author: string;
  publishedAt: Date | null;
  scheduledFor: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogDetails extends BlogListItem {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface PaginatedBlogResponse {
  posts: BlogListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
