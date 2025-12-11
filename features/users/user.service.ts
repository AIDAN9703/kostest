//drizzle
import { db } from '@/database/db';
import { users } from '@/database/schema';
import { and, count, eq, desc, or, ilike, inArray, gte } from 'drizzle-orm';
import { bookings, notifications } from '@/database/schema';
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
   * Get user optimized for admin detail page
   * Includes: owned boats count, recent bookings, captain profile
   */
  async getUserForAdmin(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        ownedBoats: {
          columns: {
            id: true,
            name: true,
            category: true,
            active: true,
            featured: true,
            mainImage: true,
            createdAt: true,
          },
          limit: 10, // Recent boats only
        },
        captainProfile: {
          columns: {
            id: true,
            status: true,
            availableForHire: true,
            uscgLicensed: true,
          },
        },
        bookings: {
          columns: {
            id: true,
            bookingStatus: true,
            bookingType: true,
            startDateTime: true,
            totalAmount: true,
            createdAt: true,
          },
          limit: 5, // Recent bookings only
          orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
        },
      },
    });

    return user || null;
  }

  /**
   * Get user optimized for profile page
   * Includes: recent bookings, reviews, unread notifications
   */
  async getUserForProfile(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        bookings: {
          columns: {
            id: true,
            bookingStatus: true,
            bookingType: true,
            startDateTime: true,
            endDateTime: true,
            totalAmount: true,
            createdAt: true,
          },
          limit: 10, // Recent bookings
          orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
        },
        reviewsAsReviewer: {
          columns: {
            id: true,
            rating: true,
            createdAt: true,
          },
          limit: 5, // Recent reviews
        },
        notifications: {
          columns: {
            id: true,
            type: true,
            title: true,
            body: true,
            status: true,
            readAt: true,
            createdAt: true,
          },
          where: (notifications, { isNull }) => isNull(notifications.readAt), // Unread only
          limit: 10,
          orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
        },
      },
    });

    return user || null;
  }

  /**
   * Get user optimized for boat owner pages
   * Includes: owned boats with full details
   */
  async getUserForBoatOwner(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        ownedBoats: {
          columns: {
            id: true,
            name: true,
            category: true,
            active: true,
            featured: true,
            featuredOrder: true,
            mainImage: true,
            capacity: true,
            lengthFt: true,
            weeklyRate: true,
            monthlyRate: true,
            averageRating: true,
            totalReviews: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: (boats, { desc }) => [desc(boats.createdAt)],
        },
        captainProfile: {
          columns: {
            id: true,
            status: true,
            availableForHire: true,
            uscgLicensed: true,
          },
        },
      },
    });

    return user || null;
  }

  /**
   * Get user by ID with all relations (boats, bookings, etc.)
   * Uses the new Drizzle relations API for cleaner queries
   * Use this when you need everything, otherwise use specific methods above
   */
  async getUserByIdWithRelations(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        ownedBoats: {
          columns: {
            id: true,
            name: true,
            category: true,
            active: true,
            featured: true,
            mainImage: true,
            createdAt: true,
          },
        },
        captainProfile: {
          columns: {
            id: true,
            status: true,
            availableForHire: true,
            uscgLicensed: true,
          },
        },
        bookings: {
          columns: {
            id: true,
            bookingStatus: true,
            bookingType: true,
            startDateTime: true,
            totalAmount: true,
            createdAt: true,
          },
          limit: 10,
          orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
        },
        reviewsAsReviewer: {
          columns: {
            id: true,
            rating: true,
            createdAt: true,
          },
          limit: 5,
        },
        notifications: {
          columns: {
            id: true,
            type: true,
            title: true,
            body: true,
            status: true,
            readAt: true,
            createdAt: true,
          },
          where: (notifications, { isNull }) => isNull(notifications.readAt),
          limit: 10,
          orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
        },
      },
    });

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
    const updateData: Partial<User> = {
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

  /**
   * Get list of admin users
   * Returns active admin users for assignment dropdowns
   */
  async getAdmins() {
    const admins = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(and(
        eq(users.role, 'ADMIN'),
        eq(users.status, 'ACTIVE')
      ))
      .orderBy(desc(users.createdAt))
      .limit(50);
    
    return admins;
  }
}

// Export singleton instance
export const userService = new UserService();
