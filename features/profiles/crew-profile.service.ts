/**
 * Crew profile: assignment lists, admin entity table, and promote-from-admin.
 */

import { db } from "@/database/db";
import { crewProfiles, users } from "@/database/schema";
import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import type { CrewStatus, UserStatus } from "@/database/types";
import type { PromoteCrewFormInput } from "@/features/profiles/promote-crew.validation";

/** Profiles in these states cannot be overwritten by admin promote (already crew or restricted). */
const NON_PROMOTABLE_CREW_STATUSES = new Set<CrewStatus>([
  "ACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
]);

export type CrewProfileAdminRow = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  userStatus: UserStatus;
  profileStatus: CrewStatus;
  adminNotes: string | null;
  profileUpdatedAt: Date;
};

export type CrewProfileAdminListResult = {
  rows: CrewProfileAdminRow[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export class CrewProfileService {
  /** Crew available for booking assignment (active profile + active user). */
  async getCrewForAssignment() {
    return db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(crewProfiles)
      .innerJoin(users, eq(crewProfiles.userId, users.id))
      .where(
        and(eq(crewProfiles.status, "ACTIVE"), eq(users.status, "ACTIVE"))
      )
      .orderBy(asc(users.lastName), asc(users.firstName))
      .limit(200);
  }

  /** Paginated crew profiles for admin entity table (all statuses). */
  async listForAdmin(filters: {
    search?: string | null;
    status?: CrewStatus | null;
    page: number;
    limit: number;
  }): Promise<CrewProfileAdminListResult> {
    const page = Math.max(1, filters.page);
    const limit = Math.min(100, Math.max(1, filters.limit));
    const offset = (page - 1) * limit;

    const conditions = [];
    const q = filters.search?.trim();
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        or(
          ilike(users.firstName, pattern),
          ilike(users.lastName, pattern),
          ilike(users.email, pattern),
          ilike(users.username, pattern)
        )!
      );
    }
    if (filters.status) {
      conditions.push(eq(crewProfiles.status, filters.status));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countBase = db
      .select({ c: count() })
      .from(crewProfiles)
      .innerJoin(users, eq(crewProfiles.userId, users.id));
    const countQuery = whereClause ? countBase.where(whereClause) : countBase;

    const dataBase = db
      .select({
        userId: crewProfiles.userId,
        profileStatus: crewProfiles.status,
        adminNotes: crewProfiles.adminNotes,
        profileUpdatedAt: crewProfiles.updatedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        userStatus: users.status,
      })
      .from(crewProfiles)
      .innerJoin(users, eq(crewProfiles.userId, users.id));
    const dataQuery = whereClause ? dataBase.where(whereClause) : dataBase;

    const [countResult, rows] = await Promise.all([
      countQuery,
      dataQuery
        .orderBy(asc(users.lastName), asc(users.firstName), asc(users.email))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(countResult[0]?.c ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return {
      rows: rows.map((r) => ({
        userId: r.userId,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        username: r.username,
        userStatus: r.userStatus,
        profileStatus: r.profileStatus,
        adminNotes: r.adminNotes,
        profileUpdatedAt: r.profileUpdatedAt,
      })),
      totalCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create or (re)activate a crew profile from admin promotion.
   * Sets status ACTIVE so the user appears in booking crew assignment.
   * Fails if profile is already ACTIVE, ON_LEAVE, or SUSPENDED.
   */
  async promoteFromAdmin(userId: string, data: PromoteCrewFormInput): Promise<void> {
    const existing = await db.query.crewProfiles.findFirst({
      where: eq(crewProfiles.userId, userId),
    });
    if (existing && NON_PROMOTABLE_CREW_STATUSES.has(existing.status)) {
      throw new Error("This user already has a crew profile.");
    }

    const notes = data.adminNotes?.trim() || null;

    if (!existing) {
      await db.insert(crewProfiles).values({
        userId,
        status: "ACTIVE",
        adminNotes: notes,
      });
    } else {
      await db
        .update(crewProfiles)
        .set({
          status: "ACTIVE",
          adminNotes: notes,
          updatedAt: new Date(),
        })
        .where(eq(crewProfiles.userId, userId));
    }
  }
}

export const crewProfileService = new CrewProfileService();
