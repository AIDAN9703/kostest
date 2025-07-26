import { pgEnum } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("PaymentStatus", [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "CHARGEBACK",
  ]);


  // Optional: Keep if you need to itemize charges
export const lineItemTypeEnum = pgEnum("LineItemType", [
    "CLEANING",
    "CAPTAIN",
    "VESSEL_FEE",
    "BOOKING_FEE",
    "TAX",
    "TRANSACTION_FEE",
    "OTHER"
  ]);