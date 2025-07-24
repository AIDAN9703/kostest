'use server';

import { db } from '@/database/db';
import { generalInquiries } from '@/database/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq, desc, sql, and } from 'drizzle-orm';

// Schema for validation - defined inline for server actions
const generalInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  date: z.string().optional(),
  time: z.string().optional(),
  budget: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().optional(),
  termsAccepted: z.boolean().refine(async (val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

// Type for the client to use
export type GeneralInquiryInput = z.input<typeof generalInquirySchema>;

/**
 * Creates a general booking inquiry
 */
export async function createGeneralInquiry(data: GeneralInquiryInput) {
  try {
    // Validate data first
    const validatedData = await generalInquirySchema.parseAsync(data);
    
    // Create the inquiry in the database
    const result = await db.insert(generalInquiries).values({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      date: validatedData.date ? new Date(validatedData.date) : null,
      time: validatedData.time || null,
      budget: validatedData.budget || null,
      guests: validatedData.guests ? parseInt(validatedData.guests) : null,
      message: validatedData.message || null,
      termsAccepted: validatedData.termsAccepted,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // Revalidate any admin pages that might show inquiries
    revalidatePath('/admin/inquiries');
    
    return { 
      success: true, 
      inquiry: result[0],
      message: 'Your inquiry has been submitted successfully. Our team will contact you shortly.'
    };
  } catch (error) {
    console.error('Error creating general inquiry:', error);
    
    if (error instanceof z.ZodError) {
      // Return validation errors
      return { 
        success: false, 
        error: 'Invalid inquiry data',
        fieldErrors: error.flatten().fieldErrors
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to submit your inquiry. Please try again.'
    };
  }
}

/**
 * Admin function to get all general inquiries with filtering
 */
export async function getGeneralInquiries(options: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { 
    status,
    page = 1, 
    limit = 20
  } = options;
  
  const offset = (page - 1) * limit;
  
  try {
    // Create base conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(generalInquiries.status, status));
    }
    
    // Execute query with conditions
    const inquiries = await db
      .select()
      .from(generalInquiries)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(generalInquiries.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(generalInquiries)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const count = Number(countResult[0].count);
    
    return {
      inquiries,
      pagination: {
        total: count,
        pageCount: Math.ceil(count / limit),
        page,
        limit
      }
    };
  } catch (error) {
    console.error('Error fetching general inquiries:', error);
    throw new Error('Failed to fetch inquiries');
  }
}

/**
 * Update the status of a general inquiry
 */
export async function updateInquiryStatus(id: string, status: string, notes?: string) {
  try {
    const result = await db
      .update(generalInquiries)
      .set({ 
        status,
        notes: notes,
        updatedAt: new Date(),
        ...(status === 'CONTACTED' ? { contactedAt: new Date() } : {}),
        ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {})
      })
      .where(eq(generalInquiries.id, id))
      .returning();
    
    revalidatePath('/admin/inquiries');
    
    return {
      success: true,
      inquiry: result[0]
    };
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return {
      success: false,
      error: 'Failed to update inquiry status'
    };
  }
} 