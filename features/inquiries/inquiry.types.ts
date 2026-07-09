import type { Inquiry } from "@/database/types";

export type InquiryListItem = Pick<
  Inquiry,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "stage"
  | "outcome"
  | "leadType"
  | "source"
  | "date"
  | "budget"
  | "guests"
  | "message"
  | "boatId"
  | "pricingTierId"
  | "requestedStartDateTime"
  | "requestedEndDateTime"
  | "preferredDate"
  | "preferredTimeOfDay"
  | "requestedDurationDays"
  | "destination"
  | "needsCaptain"
  | "estimatedTotalCents"
  | "currency"
  | "assignedTo"
  | "convertedBookingId"
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