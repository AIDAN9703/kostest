//drizzle
import { db } from '@/database/db';
import { users } from '@/database/schema';
import { and, count, eq, desc, or, ilike, inArray, gte } from 'drizzle-orm';
import { type User, type UserStatus } from '@/database/types';

//types
import { type UserFilterInput, type CreateUserInput, type UpdateUserInput } from '@/features/users/user.validation';
import { type PaginatedUsersResponse } from '@/features/users/user.types';

//bcrypt
import { hash } from 'bcryptjs';

/**
 * User Service Layer
 * Single source of truth for all user database operations
 */
export class UserService {
  /**
   * Get paginated and filtered users
   */
  async getAllUsers(filters?: UserFilterInput): Promise<PaginatedUsersResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    // Build queries
    let query = db.select().from(users);
    let countQuery = db.select({ count: count() }).from(users);

    if (filters) {
      const conditions = [];

      // Search across multiple fields
      if (filters.search) {
        conditions.push(
          or(
            ilike(users.firstName, `%${filters.search}%`),
            ilike(users.lastName, `%${filters.search}%`),
            ilike(users.email, `%${filters.search}%`),
            ilike(users.username, `%${filters.search}%`)
          )
        );
      }

      // Status filter
      if (filters.status) {
        conditions.push(eq(users.status, filters.status));
      }

      // Role filter  
      if (filters.role) {
        conditions.push(eq(users.role, filters.role));
      }

      // Apply conditions if any exist
      if (conditions.length > 0) {
        const whereClause = and(...conditions);
        query = query.where(whereClause) as any;
        countQuery = countQuery.where(whereClause) as any;
      }
    }

    // Execute in parallel for performance
    const [usersData, totalCountResult] = await Promise.all([
      query.orderBy(desc(users.createdAt)).limit(limit).offset(offset),
      countQuery
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      users: usersData,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  /**
   * Create new user (with password hashing)
   */
  async createUser(userData: CreateUserInput): Promise<User> {
    // Hash password before storage (CRITICAL!)
    const hashedPassword = await hash(userData.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    return newUser;
  }

  /**
   * Update user (partial updates allowed)
   */
  async updateUser(id: string, data: Partial<UpdateUserInput>): Promise<User> {
    // Prepare update data
    const updateData: Partial<typeof users.$inferInsert> = {
      ...data,
      updatedAt: new Date(),
    };
    
    // Hash password if being updated
    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  /**
   * Bulk update users (multiple users at once)
   */
  async bulkUpdateUsers(userIds: string[], updates: Partial<User>): Promise<User[]> {
    return db
      .update(users)
      .set(updates)
      .where(inArray(users.id, userIds))
      .returning();
  }

  /**
   * Delete user (hard delete)
   */
  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  /**
   * Soft delete user (recommended for production)
   * Suspends user instead of hard delete
   */
  async softDeleteUser(id: string): Promise<User> {
    const [deletedUser] = await db
      .update(users)
      .set({ 
        status: 'SUSPENDED' as UserStatus,
      })
      .where(eq(users.id, id))
      .returning();

    return deletedUser;
  }

  /**
   * Get user statistics
   * Returns aggregate counts for dashboard
   */
  async getUserStats() {
    // Calculate start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all stats in parallel for performance
    const [
      totalUsersResult,
      activeUsersResult,
      adminUsersResult,
      newUsersThisMonthResult,
    ] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users),
      
      // Active users
      db.select({ count: count() })
        .from(users)
        .where(eq(users.status, 'ACTIVE')),
      
      // Admin users
      db.select({ count: count() })
        .from(users)
        .where(eq(users.role, 'ADMIN')),
      
      // New users this month
      db.select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, startOfMonth)),
    ]);

    return {
      totalUsers: totalUsersResult[0]?.count || 0,
      activeUsers: activeUsersResult[0]?.count || 0,
      adminUsers: adminUsersResult[0]?.count || 0,
      newUsersThisMonth: newUsersThisMonthResult[0]?.count || 0,
    };
  }

  /**
   * Get list of available boat owners
   * Returns active users with basic info for owner selection dropdowns
   */
  async getBoatOwners(search?: string) {
    const conditions = [];
    
    // Filter to active users only
    conditions.push(eq(users.status, 'ACTIVE'));
    
    // Optionally filter by search query
    if (search) {
      conditions.push(
        or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`)
        )
      );
    }
    
    const whereClause = and(...conditions);
    
    // Select only fields needed for dropdown
    const owners = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(50);
    
    return owners;
  }
}

// Export singleton instance
export const userService = new UserService();
