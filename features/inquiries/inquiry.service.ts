import { db } from "@/database/db";
import {
  inquiry as inquiryTable,
  inquiryEvents,
  type InquiryStage,
  type InquiryOutcome,
} from "@/database/schema";
import { and, count, desc, eq } from "drizzle-orm";
import type { Inquiry } from "@/database/types";

export interface InquiryFilterInput {
  stage?: InquiryStage;
  outcome?: InquiryOutcome;
  page?: number;
  limit?: number;
}

export interface PaginatedInquiriesResponse {
  inquiries: Inquiry[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class InquiryService {
  async getAllInquiries(filters?: InquiryFilterInput): Promise<PaginatedInquiriesResponse> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const offset = (page - 1) * limit;

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
        .select()
        .from(inquiryTable)
        .where(whereClause)
        .orderBy(desc(inquiryTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(inquiryTable).where(whereClause),
    ]);

    const totalCount = Number(countResult[0]?.value ?? 0);

    return {
      inquiries: inquiryRows,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getInquiryById(id: string): Promise<(Inquiry & { events: unknown[] }) | null> {
    const [inquiry, events] = await Promise.all([
      db.query.inquiry.findFirst({
        where: eq(inquiryTable.id, id),
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

    return { ...inquiry, events } as Inquiry & { events: unknown[] };
  }
}

export const inquiryService = new InquiryService();
