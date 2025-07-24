'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { users, userRoleEnum, userStatusEnum, verifications } from '@/database/schema'
import { and, count, eq, desc, or, like, isNull } from 'drizzle-orm'
import { hash } from "bcryptjs";
import { 
  createUserSchema, 
  updateUserSchema, 
  userFilterSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserFilterInput
} from '@/features-admin/_validation/users';
import { z } from 'zod';

// Helper to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get all users with pagination, filtering, and sorting
 */
export async function getAllUsers(options: { page?: number; limit?: number } = {}) {
  try {
    const { 
      page = 1, 
      limit = 10,
    } = options;
    
    const offset = (page - 1) * limit;
    
    // OPTIMIZATION: Only select fields needed for the user listing
    const selectFields = {
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImage: users.profileImage,
      status: users.status,
      role: users.role,
      phoneNumber: users.phoneNumber,
    };
    
    // Execute both queries concurrently for better performance
    const [usersData, countResult] = await Promise.all([
      db.select(selectFields)
        .from(users)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt)),
        
      db.select({ value: count() })
        .from(users)
    ]);
    
    const totalCount = countResult[0].value;
    
    return {
      users: usersData,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error in getAllUsers:", error.errors);
      throw new Error("Invalid filter parameters");
    }
    throw error;
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return user || null;
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserInput) {
  try {
    // Validate input data
    const validatedData = createUserSchema.parse(userData);
    
    // Check if user with the same email or username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, validatedData.email),
          validatedData.username ? eq(users.username, validatedData.username) : undefined
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error(
        `User with this ${existingUser[0].email === validatedData.email ? 'email' : 'username'} already exists.`
      );
    }

    // Hash the password before storing
    const hashedPassword = await hash(validatedData.password, 10);

    // Extract validated data and adjust types where needed
    const insertData = {
      ...validatedData,
      password: hashedPassword,
      // Convert string date to Date object if present
      boatingLicenseExpiry: validatedData.boatingLicenseExpiry 
        ? new Date(validatedData.boatingLicenseExpiry) 
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create the new user
    const result = await db.insert(users).values(insertData).returning();

    // Get the created user to return it
    const newUser = await getUserById(result[0].id);
    revalidatePath('/admin/users');
    return newUser;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error in createUser:", error.errors);
      throw new Error("Invalid user data");
    }
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: UpdateUserInput) {
  try {
    if (!id || !isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    // Validate input data
    const validatedData = updateUserSchema.parse(data);
    
    // Handle password update separately
    let updateData: any = { ...validatedData };
    
    if (validatedData.password) {
      // Hash the new password
      const hashedPassword = await hash(validatedData.password, 10);
      updateData.password = hashedPassword;
    } else {
      // Don't update password if not provided
      delete updateData.password;
    }
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    revalidatePath(`/admin/users/${id}`);
    revalidatePath('/admin/users');
    
    return user;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error in updateUser:", error.errors);
      throw new Error("Invalid user data");
    }
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  try {
    // First delete any verification records
    await db
      .delete(verifications)
      .where(eq(verifications.userId, id));

    // Then delete the user
    await db
      .delete(users)
      .where(eq(users.id, id));
    
    revalidatePath('/admin/users');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user. Please try again.");
  }
}

/**
 * Get list of available boat owners for owner selection
 */
export async function getBoatOwners(search?: string) {
  try {
    const whereConditions = [];
    
    // Filter to active users
    whereConditions.push(eq(users.status, 'ACTIVE'));
    
    // Optionally filter by search query
    if (search) {
      whereConditions.push(or(
        like(users.firstName || '', `%${search}%`),
        like(users.lastName || '', `%${search}%`),
        like(users.email || '', `%${search}%`),
        like(users.username, `%${search}%`)
      ));
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Select only the fields needed for the dropdown
    const owners = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        profileImage: users.profileImage
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(50);
    
    return owners;
  } catch (error) {
    console.error("Error fetching boat owners:", error);
    throw new Error("Failed to fetch owners");
  }
} 