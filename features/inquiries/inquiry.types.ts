import type { GeneralInquiry } from "@/database/types";

export type InquiryListItem = Pick<GeneralInquiry,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "stage"
  | "date"
  | "outcome"
  | "budget"
  | "guests"
  | "message"
  | "createdAt"
  | "updatedAt"
>;

export interface PaginatedInquiriesResponse {
  inquiries: InquiryListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}