import { db } from "@/database/db";
import {
  inquiry as inquiryTable,
  inquiryEvents,
  users,
  type InquiryStage,
  type InquiryOutcome,
} from "@/database/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { resolveAdminListPagination } from "@/shared/admin/list-pagination";
import type { Inquiry } from "@/database/types";

export interface InquiryFilterInput {
  stage?: InquiryStage;
  outcome?: InquiryOutcome;
  page?: number;
  limit?: number;
}

/** Minimal admin identity attached to an inquiry (assignee). */
export type InquiryAssignee = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profileImage: string | null;
};

export type InquiryWithAssignee = Inquiry & { assignee: InquiryAssignee | null };

export interface PaginatedInquiriesResponse {
  inquiries: InquiryWithAssignee[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class InquiryService {
  async getAllInquiries(filters?: InquiryFilterInput): Promise<PaginatedInquiriesResponse> {
    const { page, limit, offset } = resolveAdminListPagination(filters);

    const conditions = [];
    if (filters?.stage) {
      conditions.push(eq(inquiryTable.stage, filters.stage));
    }
    if (filters?.outcome) {
      conditions.push(eq(inquiryTable.outcome, filters.outcome));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [inquiryRows, countResult] = await Promise.all([
      db
        .select({
          inquiry: inquiryTable,
          assignee: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            profileImage: users.profileImage,
          },
        })
        .from(inquiryTable)
        .leftJoin(users, eq(inquiryTable.assignedTo, users.id))
        .where(whereClause)
        .orderBy(desc(inquiryTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(inquiryTable).where(whereClause),
    ]);

    const totalCount = Number(countResult[0]?.value ?? 0);

    return {
      inquiries: inquiryRows.map((r) => ({ ...r.inquiry, assignee: r.assignee ?? null })),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getInquiryById(
    id: string
  ): Promise<(InquiryWithAssignee & { events: unknown[] }) | null> {
    const [inquiry, events] = await Promise.all([
      db.query.inquiry.findFirst({
        where: eq(inquiryTable.id, id),
        with: {
          assignedToUser: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      }),
      db.query.inquiryEvents.findMany({
        where: eq(inquiryEvents.inquiryId, id),
        orderBy: (events, { desc }) => desc(events.createdAt),
        with: {
          createdByUser: {
            columns: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
    ]);

    if (!inquiry) return null;

    const { assignedToUser, ...rest } = inquiry as typeof inquiry & {
      assignedToUser: InquiryAssignee | null;
    };

    return {
      ...rest,
      assignee: assignedToUser ?? null,
      events,
    } as InquiryWithAssignee & { events: unknown[] };
  }
}

export const inquiryService = new InquiryService();
