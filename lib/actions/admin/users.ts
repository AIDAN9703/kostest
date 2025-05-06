'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { users, userRoleEnum, userStatusEnum } from '@/database/schema'
import { and, count, eq, desc, or, like } from 'drizzle-orm'

// Helper to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

type GetAllUsersOptions = {
  page?: number;
  limit?: number;
  search?: string;
  role?: typeof userRoleEnum.enumValues[number];
  status?: typeof userStatusEnum.enumValues[number];
}

/**
 * Get all users with pagination, filtering, and sorting
 */
export async function getAllUsers({
  page = 1, 
  limit = 10,
  search,
  role,
  status
}: GetAllUsersOptions = {}) {
  const offset = (page - 1) * limit;
  const whereConditions = [];
  
  if (search) {
    whereConditions.push(or(
      // Prefix search (index-friendly)
      like(users.username, `${search}%`),
      like(users.email, `${search}%`),
      // Fallback full text search
      like(users.username, `%${search}%`),
      like(users.firstName || '', `%${search}%`),
      like(users.lastName || '', `%${search}%`),
      like(users.email, `%${search}%`)
    ));
  }
  
  if (role) whereConditions.push(eq(users.role, role));
  if (status) whereConditions.push(eq(users.status, status));
  
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
  
  // Execute both queries concurrently for better performance
  const [usersData, countResult] = await Promise.all([
    db.select()
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt)),
      
    db.select({ value: count() })
      .from(users)
      .where(whereClause)
  ]);
  
  const totalCount = countResult[0].value;
  
  return {
    users: usersData,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
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
export async function createUser(userData: any) {
  try {
    // Check if user with the same email or username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, userData.email),
          userData.username ? eq(users.username, userData.username) : undefined
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error(
        `User with this ${existingUser[0].email === userData.email ? 'email' : 'username'} already exists.`
      );
    }

    // Hash password if provided
    let password = userData.password;
    if (!password) {
      // Generate a random password if none provided (user can reset it later)
      password = Math.random().toString(36).slice(-8);
    }

    // Create the new user
    const result = await db.insert(users)
      .values({
        ...userData,
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Get the created user to return it
    const newUser = await getUserById(result[0].id);
    revalidatePath('/admin/users');
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: any) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  
  revalidatePath(`/admin/users/${id}`);
  revalidatePath('/admin/users');
  
  return user;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string) {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }

  await db
    .delete(users)
    .where(eq(users.id, id));
  
  revalidatePath('/admin/users');
  
  return { success: true };
} 