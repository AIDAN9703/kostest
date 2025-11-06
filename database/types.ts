/**
 * Centralized type exports from database schema
 * Single source of truth for all database types
 */

// Import all tables
import {
  users,
  boats,
  bookings,
  reviews,
  boatPricingTiers,
  captains,
  blogPosts,
  generalInquiries,
  verifications,
  notifications,
  boatBlocking,
  boatGoogleCalendars,
  externalGoogleCalendarSyncEvents,
  conversations,
  messages,
  conversationParticipants,
  events,
  ticketTiers,
  eventTicketPurchases,
  eventTickets,
} from './schema/tables';

// Import all enums
import {
  // User enums
  userRoleEnum,
  userStatusEnum,
  
  // Boat enums
  boatCategoryEnum,
  locationTypeEnum,
  timezoneEnum,
  
  // Booking enums
  bookingStatusEnum,
  bookingTypeEnum,
  
  // Payment enums
  paymentStatusEnum,
  lineItemTypeEnum,
  
  // Auth enums
  authProviderEnum,
  verificationTypeEnum,
  verificationStatusEnum,
  verificationChannelEnum,
  
  // Messaging enums
  conversationTypeEnum,
  conversationStatusEnum,
  messageTypeEnum,
  messageStatusEnum,
  
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
export type UserRole = typeof userRoleEnum.enumValues[number];

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

// Booking enums
export type BookingStatus = typeof bookingStatusEnum.enumValues[number];
export type BookingType = typeof bookingTypeEnum.enumValues[number];

// ========================================
// CAPTAIN TYPES
// ========================================

export type Captain = typeof captains.$inferSelect;
export type NewCaptain = typeof captains.$inferInsert;

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
// MESSAGING TYPES
// ========================================

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipants.$inferInsert;

// Messaging enums
export type ConversationType = typeof conversationTypeEnum.enumValues[number];
export type ConversationStatus = typeof conversationStatusEnum.enumValues[number];
export type MessageType = typeof messageTypeEnum.enumValues[number];
export type MessageStatus = typeof messageStatusEnum.enumValues[number];

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

// ========================================
// PAYMENT TYPES (enums only)
// ========================================

export type PaymentStatus = typeof paymentStatusEnum.enumValues[number];
export type LineItemType = typeof lineItemTypeEnum.enumValues[number];

// ========================================
// COMMON FILTER TYPES
// ========================================

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  page?: number;
  limit?: number;
}

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
