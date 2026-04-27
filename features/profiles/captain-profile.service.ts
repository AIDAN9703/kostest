/**
 * Captain profile: assignment lists, admin entity table, and promote-from-admin.
 */

import { db } from "@/database/db";
import { captainProfiles, users } from "@/database/schema";
import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import type { CaptainStatus, UserStatus } from "@/database/types";
import type { PromoteCaptainFormInput } from "@/features/profiles/promote-captain.validation";

const DISABLED_STATUS: CaptainStatus = "INACTIVE";

export type CaptainProfileAdminRow = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  userStatus: UserStatus;
  profileStatus: CaptainStatus;
  uscgLicensed: boolean;
  licenseType: string | null;
  profileUpdatedAt: Date;
};

export type CaptainProfileAdminListResult = {
  rows: CaptainProfileAdminRow[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export class CaptainProfileService {
  /** Captains available for booking assignment (active profile + active user). */
  async getCaptainsForAssignment() {
    return db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(captainProfiles)
      .innerJoin(users, eq(captainProfiles.userId, users.id))
      .where(
        and(eq(captainProfiles.status, "ACTIVE"), eq(users.status, "ACTIVE"))
      )
      .orderBy(asc(users.lastName), asc(users.firstName))
      .limit(200);
  }

  /** Paginated captain profiles for admin entity table (all statuses). */
  async listForAdmin(filters: {
    search?: string | null;
    status?: CaptainStatus | null;
    page: number;
    limit: number;
  }): Promise<CaptainProfileAdminListResult> {
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
      conditions.push(eq(captainProfiles.status, filters.status));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countBase = db
      .select({ c: count() })
      .from(captainProfiles)
      .innerJoin(users, eq(captainProfiles.userId, users.id));
    const countQuery = whereClause ? countBase.where(whereClause) : countBase;

    const dataBase = db
      .select({
        userId: captainProfiles.userId,
        profileStatus: captainProfiles.status,
        uscgLicensed: captainProfiles.uscgLicensed,
        licenseType: captainProfiles.licenseType,
        profileUpdatedAt: captainProfiles.updatedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        userStatus: users.status,
      })
      .from(captainProfiles)
      .innerJoin(users, eq(captainProfiles.userId, users.id));
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
        uscgLicensed: r.uscgLicensed,
        licenseType: r.licenseType,
        profileUpdatedAt: r.profileUpdatedAt,
      })),
      totalCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create or reactivate a captain profile from admin promotion (with compliance fields).
   * Fails if a non-INACTIVE profile already exists.
   */
  async promoteFromAdmin(userId: string, data: PromoteCaptainFormInput): Promise<void> {
    const existing = await db.query.captainProfiles.findFirst({
      where: eq(captainProfiles.userId, userId),
    });
    if (existing && existing.status !== DISABLED_STATUS) {
      throw new Error("This user already has a captain profile.");
    }

    const expiryRaw = data.licenseExpiry?.trim();
    let licenseExpiry: Date | null = null;
    if (expiryRaw) {
      const d = new Date(expiryRaw);
      if (!Number.isNaN(d.getTime())) {
        licenseExpiry = d;
      }
    }

    const payload = {
      uscgLicensed: data.uscgLicensed,
      licenseType: data.licenseType?.trim() || null,
      licenseNumber: data.licenseNumber?.trim() || null,
      licenseExpiry,
      emergencyContactName: data.emergencyContactName?.trim() || null,
      emergencyContactPhone: data.emergencyContactPhone?.trim() || null,
      yearsExperience: data.yearsExperience ?? null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      zip: data.zip?.trim() || null,
      adminNotes: data.adminNotes?.trim() || null,
      updatedAt: new Date(),
    };

    if (!existing) {
      await db.insert(captainProfiles).values({
        userId,
        status: "PENDING",
        ...payload,
      });
    } else {
      await db
        .update(captainProfiles)
        .set({
          status: "PENDING",
          ...payload,
        })
        .where(eq(captainProfiles.userId, userId));
    }
  }
}

export const captainProfileService = new CaptainProfileService();
