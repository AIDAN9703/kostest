/**
 * Owner profile reads (users who can own / list boats).
 */

import { db } from "@/database/db";
import { ownerProfiles, users } from "@/database/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export class OwnerProfileService {
  /** Active users with an owner_profile row (boat owner picker). */
  async getOwnersForAssignment(search?: string) {
    const conditions = [eq(users.status, "ACTIVE")];

    if (search) {
      conditions.push(
        or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`)
        )!
      );
    }

    return db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(users)
      .innerJoin(ownerProfiles, eq(ownerProfiles.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(50);
  }
}

export const ownerProfileService = new OwnerProfileService();
