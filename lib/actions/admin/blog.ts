"use server";

import { db } from "@/database/db";
import { blogPosts } from "@/database/schema";
import { auth } from "@/auth";
import { eq, desc, and, or, like, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
  category: "FLEET_NEWS" | "CONSERVATION" | "TIPS_ADVICE" | "CASE_STUDY" | "COMPANY_NEWS" | "SAFETY" | "EVENTS";
  isFeatured: boolean;
  featuredImage?: string | null;
  imageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  author: string;
  publishedAt?: Date | null;
  scheduledFor?: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
  category: "FLEET_NEWS" | "CONSERVATION" | "TIPS_ADVICE" | "CASE_STUDY" | "COMPANY_NEWS" | "SAFETY" | "EVENTS";
  author: string;
  isFeatured?: boolean;
  featuredImage?: string;
  imageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
  scheduledFor?: Date;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}



// Helper function to check admin permissions
async function checkAdminPermissions() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized - Please log in');
  }
  
  // Check if user is admin (you might want to adjust this based on your role system)
  if (session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized - Admin access required');
  }
  
  return session.user;
}

// Get all blog posts with pagination and filtering
export async function getBlogPosts(options: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  featured?: boolean;
} = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      featured
    } = options;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(blogPosts.status, status as any));
    }
    
    if (category) {
      conditions.push(eq(blogPosts.category, category as any));
    }
    
    if (featured !== undefined) {
      conditions.push(eq(blogPosts.isFeatured, featured));
    }
    
    if (search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${search}%`),
          like(blogPosts.excerpt, `%${search}%`),
          like(blogPosts.content, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get posts
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        status: blogPosts.status,
        category: blogPosts.category,
        isFeatured: blogPosts.isFeatured,
        featuredImage: blogPosts.featuredImage,
        imageAlt: blogPosts.imageAlt,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        author: blogPosts.author,
        publishedAt: blogPosts.publishedAt,
        scheduledFor: blogPosts.scheduledFor,
        viewCount: blogPosts.viewCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(whereClause);

    return {
      posts,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
}

// Get published blog posts for public display
export async function getPublishedBlogPosts(options: {
  limit?: number;
  featured?: boolean;
  category?: string;
} = {}) {
  try {
    const { limit = 10, featured, category } = options;

    const conditions = [eq(blogPosts.status, 'PUBLISHED')];
    
    if (featured !== undefined) {
      conditions.push(eq(blogPosts.isFeatured, featured));
    }
    
    if (category) {
      conditions.push(eq(blogPosts.category, category as any));
    }

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        status: blogPosts.status,
        category: blogPosts.category,
        isFeatured: blogPosts.isFeatured,
        featuredImage: blogPosts.featuredImage,
        imageAlt: blogPosts.imageAlt,
        publishedAt: blogPosts.publishedAt,
        viewCount: blogPosts.viewCount,
        author: blogPosts.author,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);

    return posts;
  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    throw new Error('Failed to fetch published blog posts');
  }
}

// Get single blog post by ID
export async function getBlogPostById(id: string) {
  try {
    const [post] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        status: blogPosts.status,
        category: blogPosts.category,
        isFeatured: blogPosts.isFeatured,
        featuredImage: blogPosts.featuredImage,
        imageAlt: blogPosts.imageAlt,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        author: blogPosts.author,
        publishedAt: blogPosts.publishedAt,
        scheduledFor: blogPosts.scheduledFor,
        viewCount: blogPosts.viewCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.id, id));

    return post || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw new Error('Failed to fetch blog post');
  }
}

// Get blog post by slug for public display
export async function getBlogPostBySlug(slug: string) {
  try {
    const [post] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        status: blogPosts.status,
        category: blogPosts.category,
        isFeatured: blogPosts.isFeatured,
        featuredImage: blogPosts.featuredImage,
        imageAlt: blogPosts.imageAlt,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        publishedAt: blogPosts.publishedAt,
        viewCount: blogPosts.viewCount,
        author: blogPosts.author,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.status, 'PUBLISHED')
      ));

    return post || null;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    throw new Error('Failed to fetch blog post');
  }
}

// Create new blog post
export async function createBlogPost(data: CreateBlogPostData) {
  try {
    const user = await checkAdminPermissions();

    // Slug is required and provided by user
    const slug = data.slug;

    const now = new Date();
    const publishedAt = data.status === 'PUBLISHED' ? (data.publishedAt || now) : null;

    const insertData: any = {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      category: data.category,
      isFeatured: data.isFeatured || false,
      author: data.author,
      publishedAt,
      createdAt: now,
      updatedAt: now,
    };

    // Only add optional fields if they have values
    if (data.featuredImage) insertData.featuredImage = data.featuredImage;
    if (data.imageAlt) insertData.imageAlt = data.imageAlt;
    if (data.metaTitle) insertData.metaTitle = data.metaTitle;
    if (data.metaDescription) insertData.metaDescription = data.metaDescription;
    if (data.scheduledFor) insertData.scheduledFor = data.scheduledFor;

    const [newPost] = await db
      .insert(blogPosts)
      .values(insertData)
      .returning();

    revalidatePath('/admin/blog');
    revalidatePath('/news');

    return { success: true, post: newPost };
  } catch (error) {
    console.error('Error creating blog post:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create blog post' 
    };
  }
}

// Update blog post
export async function updateBlogPost(data: UpdateBlogPostData) {
  try {
    await checkAdminPermissions();

    const { id, ...updateData } = data;
    
    // Slug is manually managed by user

    const now = new Date();
    
    // Handle publishing logic
    if (updateData.status === 'PUBLISHED') {
      const currentPost = await getBlogPostById(id);
      if (currentPost && !currentPost.publishedAt) {
        updateData.publishedAt = updateData.publishedAt || now;
      }
    }

    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        ...updateData,
        updatedAt: now,
      })
      .where(eq(blogPosts.id, id))
      .returning();

    revalidatePath('/admin/blog');
    revalidatePath('/news');

    return { success: true, post: updatedPost };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update blog post' 
    };
  }
}

// Delete blog post
export async function deleteBlogPost(id: string) {
  try {
    await checkAdminPermissions();

    await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id));

    revalidatePath('/admin/blog');
    revalidatePath('/news');

    return { success: true };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete blog post' 
    };
  }
}

// Increment view count
export async function incrementViewCount(id: string) {
  try {
    await db
      .update(blogPosts)
      .set({
        viewCount: sql`${blogPosts.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id));

    return { success: true };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return { success: false };
  }
} 