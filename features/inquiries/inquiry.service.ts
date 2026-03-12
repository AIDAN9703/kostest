import { db } from "@/database/db";
import {
  generalInquiries,
  inquiryEvents,
  type InquiryStage,
  type InquiryOutcome,
} from "@/database/schema";
import { and, count, desc, eq } from "drizzle-orm";
import type { GeneralInquiry } from "@/database/types";

export interface InquiryFilterInput {
  stage?: InquiryStage;
  outcome?: InquiryOutcome;
  page?: number;
  limit?: number;
}

export interface PaginatedInquiriesResponse {
  inquiries: GeneralInquiry[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class InquiryService {
  async getAllInquiries(
    filters?: InquiryFilterInput
  ): Promise<PaginatedInquiriesResponse> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters?.stage) {
      conditions.push(eq(generalInquiries.stage, filters.stage));
    }
    if (filters?.outcome) {
      conditions.push(eq(generalInquiries.outcome, filters.outcome));
    }
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [inquiries, countResult] = await Promise.all([
      db
        .select()
        .from(generalInquiries)
        .where(whereClause)
        .orderBy(desc(generalInquiries.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(generalInquiries)
        .where(whereClause),
    ]);

    const totalCount = Number(countResult[0]?.value ?? 0);

    return {
      inquiries,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getInquiryById(
    id: string
  ): Promise<(GeneralInquiry & { events: unknown[] }) | null> {
    const [inquiry, events] = await Promise.all([
      db.query.generalInquiries.findFirst({
        where: eq(generalInquiries.id, id),
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

    return { ...inquiry, events } as GeneralInquiry & { events: unknown[] };
  }
}

export const inquiryService = new InquiryService();
