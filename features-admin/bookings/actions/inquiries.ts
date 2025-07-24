'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { generalInquiries } from '@/database/schema'
import { and, eq, desc, sql } from 'drizzle-orm'

/**
 * Get all general inquiries with pagination, filtering, and sorting
 * This is optimized for admin use with minimal DB load
 */
export async function getInquiries(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  const { 
    page = 1, 
    limit = 10,
    status,
    search
  } = options;
  
  const offset = (page - 1) * limit;
  const conditions = [];
  
  // Add filters if provided
  if (status) {
    conditions.push(eq(generalInquiries.status, status));
  }
  
  // Simple search across name and email
  if (search) {
    conditions.push(
      sql`(${generalInquiries.name} ILIKE ${`%${search}%`} OR ${generalInquiries.email} ILIKE ${`%${search}%`})`
    );
  }
  
  // Execute query with conditions
  const inquiriesData = await db
    .select()
    .from(generalInquiries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(generalInquiries.createdAt));
  
  // Get total count for pagination (using a separate count query)
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(generalInquiries)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  const totalCount = Number(countResult[0].count);
  
  return {
    inquiries: inquiriesData,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

/**
 * Get a single inquiry by ID
 */
export async function getInquiryById(id: string) {
  if (!id) {
    throw new Error("Inquiry ID is required");
  }

  const inquiryData = await db
    .select()
    .from(generalInquiries)
    .where(eq(generalInquiries.id, id))
    .limit(1);
  
  return inquiryData[0] || null;
}

/**
 * Update inquiry status and add notes
 */
export async function updateInquiryStatus(id: string, data: {
  status: string;
  notes?: string;
  assignedTo?: string;
}) {
  if (!id) {
    throw new Error("Inquiry ID is required");
  }

  const { status, notes, assignedTo } = data;
  
  const updateData: any = { 
    status,
    updatedAt: new Date()
  };
  
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  
  if (assignedTo !== undefined) {
    updateData.assignedTo = assignedTo;
  }
  
  // Set timestamps based on status
  if (status === 'CONTACTED') {
    updateData.contactedAt = new Date();
  } else if (status === 'RESOLVED') {
    updateData.resolvedAt = new Date();
  }

  const result = await db
    .update(generalInquiries)
    .set(updateData)
    .where(eq(generalInquiries.id, id))
    .returning();
  
  revalidatePath('/admin/inquiries');
  revalidatePath(`/admin/inquiries/${id}`);
  
  return result[0];
}

/**
 * Delete an inquiry (admin only)
 */
export async function deleteInquiry(id: string) {
  if (!id) {
    throw new Error("Inquiry ID is required");
  }

  await db
    .delete(generalInquiries)
    .where(eq(generalInquiries.id, id));
  
  revalidatePath('/admin/inquiries');
  
  return { success: true };
} 