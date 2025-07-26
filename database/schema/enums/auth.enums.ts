import { pgEnum } from "drizzle-orm/pg-core";

export const verificationTypeEnum = pgEnum("VerificationType", [
    "PHONE",
    "EMAIL",
    "IDENTITY",
    "AGE",
    "PAYMENT_METHOD",
  ]);
  
  export const verificationStatusEnum = pgEnum("VerificationStatus", [
    "PENDING",
    "PASSED",
    "FAILED",
    "EXPIRED",
  ]);
  
  // Add new verification channel enum
  export const verificationChannelEnum = pgEnum("VerificationChannel", [
    "SMS",
    "CALL",
    "EMAIL",
    "WHATSAPP",
  ]);

  export const authProviderEnum = pgEnum("AuthProvider", [
    "EMAIL",
    "GOOGLE",
    "FACEBOOK",
    "APPLE"
  ]);