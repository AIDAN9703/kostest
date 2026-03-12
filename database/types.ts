/**
 * Centralized type exports from database schema
 * Single source of truth for all database types
 */

// Import all tables
import {
  users,
  boats,
  bookings,
  bookingPricing,
  bookingStatusHistory,
  bookingAdminNotes,
  payments,
  reviews,
  boatPricingTiers,
  captainProfiles,
  ownerProfiles,
  blogPosts,
  generalInquiries,
  inquiryEvents,
  verifications,
  notifications,
  boatBlocking,
  boatGoogleCalendars,
  externalGoogleCalendarSyncEvents,
  events,
  ticketTiers,
  eventTicketPurchases,
  eventTickets,
} from './schema/tables';

// Import all enums
import {
  // User enums
  userStatusEnum,
  captainStatusEnum,
  ownerBusinessTypeEnum,
  
  // Boat enums
  boatCategoryEnum,
  locationTypeEnum,
  timezoneEnum,
  
  // Booking enums
  bookingStatusEnum,
  bookingTypeEnum,
  bookingSourceEnum,
  adminNoteTypeEnum,
  
  // Payment enums
  paymentStatusEnum,
  paymentTypeEnum,
  paymentMethodTypeEnum,
  payableTypeEnum,
  lineItemTypeEnum,
  
  // Auth enums
  authProviderEnum,
  verificationTypeEnum,
  verificationStatusEnum,
  verificationChannelEnum,
  
  // Blog enums
  postCategoryEnum,
  postStatusEnum,
  
  // Notification enums
  notificationPreferenceEnum,
  
  // Availability enums
  blockingTypeEnum,
  calendarSourceEnum,
  calendarOwnerTypeEnum,
  calendarSyncStatusEnum,
} from './schema/enums';

// ========================================
// USER TYPES
// ========================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// User enums
export type UserStatus = typeof userStatusEnum.enumValues[number];
// REMOVED: UserRole type - replaced with isAdmin boolean

// ========================================
// BOAT TYPES
// ========================================

export type Boat = typeof boats.$inferSelect;
export type NewBoat = typeof boats.$inferInsert;

export type BoatPricingTier = typeof boatPricingTiers.$inferSelect;
export type NewBoatPricingTier = typeof boatPricingTiers.$inferInsert;

export type BoatBlocking = typeof boatBlocking.$inferSelect;
export type NewBoatBlocking = typeof boatBlocking.$inferInsert;

export type BoatGoogleCalendar = typeof boatGoogleCalendars.$inferSelect;
export type NewBoatGoogleCalendar = typeof boatGoogleCalendars.$inferInsert;

export type ExternalGoogleCalendarSyncEvent = typeof externalGoogleCalendarSyncEvents.$inferSelect;
export type NewExternalGoogleCalendarSyncEvent = typeof externalGoogleCalendarSyncEvents.$inferInsert;

// Boat enums
export type BoatCategory = typeof boatCategoryEnum.enumValues[number];
export type LocationType = typeof locationTypeEnum.enumValues[number];
export type Timezone = typeof timezoneEnum.enumValues[number];
export type BlockingType = typeof blockingTypeEnum.enumValues[number];
export type CalendarSource = typeof calendarSourceEnum.enumValues[number];
export type CalendarOwnerType = typeof calendarOwnerTypeEnum.enumValues[number];
export type CalendarSyncStatus = typeof calendarSyncStatusEnum.enumValues[number];

// ========================================
// BOOKING TYPES
// ========================================

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

// Booking pricing (1:1 with booking)
export type BookingPricing = typeof bookingPricing.$inferSelect;
export type NewBookingPricing = typeof bookingPricing.$inferInsert;

// Booking status history (audit trail)
export type BookingStatusHistory = typeof bookingStatusHistory.$inferSelect;
export type NewBookingStatusHistory = typeof bookingStatusHistory.$inferInsert;

// Booking admin notes
export type BookingAdminNote = typeof bookingAdminNotes.$inferSelect;
export type NewBookingAdminNote = typeof bookingAdminNotes.$inferInsert;

// Booking enums
export type BookingStatus = typeof bookingStatusEnum.enumValues[number];
export type BookingType = typeof bookingTypeEnum.enumValues[number];
export type BookingSource = typeof bookingSourceEnum.enumValues[number];
export type AdminNoteType = typeof adminNoteTypeEnum.enumValues[number];

// ========================================
// PAYMENT TYPES
// ========================================

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// Payment enums
export type PaymentStatus = typeof paymentStatusEnum.enumValues[number];
export type PaymentType = typeof paymentTypeEnum.enumValues[number];
export type PaymentMethodType = typeof paymentMethodTypeEnum.enumValues[number];
export type PayableType = typeof payableTypeEnum.enumValues[number];

// ========================================
// PROFILE EXTENSION TYPES
// ========================================

// Captain Profile (for users who are captains)
export type CaptainProfile = typeof captainProfiles.$inferSelect;
export type NewCaptainProfile = typeof captainProfiles.$inferInsert;
export type CaptainStatus = typeof captainStatusEnum.enumValues[number];

// Owner Profile (for users who own/list boats)
export type OwnerProfile = typeof ownerProfiles.$inferSelect;
export type NewOwnerProfile = typeof ownerProfiles.$inferInsert;
export type OwnerBusinessType = typeof ownerBusinessTypeEnum.enumValues[number];

// ========================================
// REVIEW TYPES
// ========================================

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// ========================================
// GENERAL INQUIRY TYPES
// ========================================

export type GeneralInquiry = typeof generalInquiries.$inferSelect;
export type NewGeneralInquiry = typeof generalInquiries.$inferInsert;

export type InquiryEvent = typeof inquiryEvents.$inferSelect;
export type NewInquiryEvent = typeof inquiryEvents.$inferInsert;

// ========================================
// VERIFICATION TYPES
// ========================================

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

// Verification enums
export type VerificationType = typeof verificationTypeEnum.enumValues[number];
export type VerificationStatus = typeof verificationStatusEnum.enumValues[number];
export type VerificationChannel = typeof verificationChannelEnum.enumValues[number];
export type AuthProvider = typeof authProviderEnum.enumValues[number];

// ========================================
// NOTIFICATION TYPES
// ========================================

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// Notification enums
export type NotificationPreference = typeof notificationPreferenceEnum.enumValues[number];

// ========================================
// BLOG TYPES
// ========================================

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

// Blog enums
export type PostCategory = typeof postCategoryEnum.enumValues[number];
export type PostStatus = typeof postStatusEnum.enumValues[number];

// ========================================
// EVENT TYPES
// ========================================

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type TicketTier = typeof ticketTiers.$inferSelect;
export type NewTicketTier = typeof ticketTiers.$inferInsert;

export type EventTicketPurchase = typeof eventTicketPurchases.$inferSelect;
export type NewEventTicketPurchase = typeof eventTicketPurchases.$inferInsert;

export type EventTicket = typeof eventTickets.$inferSelect;
export type NewEventTicket = typeof eventTickets.$inferInsert;

// Line item type (for itemized charges)
export type LineItemType = typeof lineItemTypeEnum.enumValues[number];

// ========================================
// COMMON FILTER TYPES
// ========================================


export interface BoatFilters {
  search?: string;
  category?: BoatCategory;
  status?: string;
  page?: number;
  limit?: number;
}

export interface BookingFilters {
  search?: string;
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
