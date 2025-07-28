/**
 * Messaging System Types
 * 
 * Comprehensive type definitions for the messaging system,
 * derived from the database schema and used throughout the application.
 */

import { z } from "zod";

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const CONVERSATION_TYPES = [
  "BOOKING",
  "GENERAL", 
  "SUPPORT",
  "ADMIN"
] as const;

export const CONVERSATION_STATUSES = [
  "ACTIVE",
  "ARCHIVED", 
  "CLOSED",
  "SYSTEM_CLOSED"
] as const;

export const MESSAGE_TYPES = [
  "TEXT",
  "IMAGE", 
  "DOCUMENT",
  "SYSTEM",
  "BOOKING_UPDATE",
  "PAYMENT_UPDATE"
] as const;

export const MESSAGE_STATUSES = [
  "SENT",
  "DELIVERED", 
  "READ",
  "FAILED"
] as const;

export const PARTICIPANT_STATUSES = [
  "ACTIVE",
  "LEFT",
  "REMOVED", 
  "MUTED"
] as const;

export const PARTICIPANT_ROLES = [
  "PARTICIPANT",
  "MODERATOR",
  "ADMIN"
] as const;

export const CONVERSATION_PRIORITIES = [
  "HIGH",
  "NORMAL", 
  "LOW"
] as const;

// =============================================================================
// BASE TYPES
// =============================================================================

export type ConversationType = (typeof CONVERSATION_TYPES)[number];
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];
export type MessageType = (typeof MESSAGE_TYPES)[number];
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];
export type ConversationPriority = (typeof CONVERSATION_PRIORITIES)[number];

// =============================================================================
// ATTACHMENT TYPES
// =============================================================================

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // File size in bytes
  thumbnailUrl?: string; // For images/videos
  uploadedAt: string; // ISO timestamp
}

// =============================================================================
// SYSTEM MESSAGE TYPES
// =============================================================================

export interface BookingUpdateData {
  bookingId: string;
  previousStatus?: string;
  newStatus: string;
  updatedBy: string;
  reason?: string;
}

export interface PaymentUpdateData {
  bookingId: string;
  paymentStatus: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
}

export type SystemMessageData = BookingUpdateData | PaymentUpdateData | Record<string, any>;

// =============================================================================
// READ STATUS TYPES
// =============================================================================

export interface ReadStatus {
  [userId: string]: string; // ISO timestamp when user read the message
}

export interface UnreadCounts {
  [userId: string]: number;
}

// =============================================================================
// CORE DATABASE TYPES (from schema)
// =============================================================================

export interface Conversation {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  bookingId?: string | null;
  initiatedBy: string;
  participantIds: string[];
  subject?: string | null;
  lastMessageId?: string | null;
  lastMessageAt: Date;
  lastActivityAt: Date;
  messageCount: number;
  unreadCount: number;
  isLocked: boolean;
  autoCloseAt?: Date | null;
  assignedAdmin?: string | null;
  priority: ConversationPriority;
  tags?: string[] | null;
  isArchived: boolean;
  archivedBy?: string | null;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  attachments?: MessageAttachment[] | null;
  status: MessageStatus;
  readBy: ReadStatus;
  readCount: number;
  isEdited: boolean;
  editedAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  systemMessageData?: SystemMessageData | null;
  isFlagged: boolean;
  flagReason?: string | null;
  flaggedBy?: string | null;
  flaggedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  status: ParticipantStatus;
  role: ParticipantRole;
  isArchived: boolean;
  isMuted: boolean;
  customName?: string | null;
  lastReadAt: Date;
  lastReadMessageId?: string | null;
  unreadCount: number;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  joinedAt: Date;
  leftAt?: Date | null;
  updatedAt: Date;
}

// =============================================================================
// EXTENDED TYPES WITH RELATIONS
// =============================================================================

export interface ConversationWithDetails extends Conversation {
  // Related data
  booking?: {
    id: string;
    boatId: string;
    boatName?: string;
    customerName: string;
    startDateTime: Date;
    bookingStatus: string;
  } | null;
  participants: Array<{
    id: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profileImage?: string;
    role: ParticipantRole;
    status: ParticipantStatus;
    lastReadAt: Date;
    unreadCount: number;
  }>;
  lastMessage?: {
    id: string;
    senderId: string;
    senderName?: string;
    content: string;
    messageType: MessageType;
    createdAt: Date;
  } | null;
  // Current user's specific data
  currentUserParticipant?: {
    role: ParticipantRole;
    unreadCount: number;
    lastReadAt: Date;
    isArchived: boolean;
    isMuted: boolean;
    notificationsEnabled: boolean;
  };
}

export interface MessageWithDetails extends Message {
  // Sender information
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profileImage?: string;
    role?: string;
  };
  // Read status with user details
  readByUsers?: Array<{
    userId: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    readAt: Date;
  }>;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreateConversationRequest {
  type: ConversationType;
  bookingId?: string;
  participantIds: string[];
  subject?: string;
  initialMessage?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  attachments?: File[];
}

export interface UpdateConversationRequest {
  subject?: string;
  status?: ConversationStatus;
  priority?: ConversationPriority;
  tags?: string[];
  isLocked?: boolean;
  assignedAdmin?: string;
}

export interface UpdateParticipantRequest {
  isArchived?: boolean;
  isMuted?: boolean;
  customName?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

export interface MarkAsReadRequest {
  conversationId: string;
  messageId?: string; // If provided, mark up to this message as read
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ConversationListResponse {
  conversations: ConversationWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalUnread: number;
}

export interface MessageListResponse {
  messages: MessageWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  conversation: ConversationWithDetails;
}

export interface ConversationResponse {
  conversation: ConversationWithDetails;
  messages: MessageWithDetails[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// =============================================================================
// REAL-TIME SOCKET TYPES
// =============================================================================

export interface SocketMessage {
  type: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'USER_TYPING' | 'USER_STOPPED_TYPING' | 'CONVERSATION_UPDATED';
  conversationId: string;
  userId?: string;
  data: any;
  timestamp: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface NewMessageEvent {
  message: MessageWithDetails;
  conversation: ConversationWithDetails;
}

export interface MessageReadEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  readAt: string;
}

// =============================================================================
// SEARCH & FILTERING TYPES
// =============================================================================

export interface ConversationFilters {
  status?: ConversationStatus[];
  type?: ConversationType[];
  priority?: ConversationPriority[];
  bookingId?: string;
  participantId?: string;
  hasUnread?: boolean;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Search in subjects and last message content
}

export interface MessageFilters {
  conversationId: string;
  messageType?: MessageType[];
  senderId?: string;
  hasAttachments?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Search in message content
}

// =============================================================================
// PAGINATION TYPES
// =============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string; // For cursor-based pagination
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface MessagingError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export const MESSAGING_ERROR_CODES = {
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  CONVERSATION_LOCKED: 'CONVERSATION_LOCKED',
  PARTICIPANT_NOT_FOUND: 'PARTICIPANT_NOT_FOUND',
  INVALID_ATTACHMENT: 'INVALID_ATTACHMENT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;

export type MessagingErrorCode = (typeof MESSAGING_ERROR_CODES)[keyof typeof MESSAGING_ERROR_CODES];