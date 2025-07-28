/**
 * Messaging System Validation Schemas
 * 
 * Comprehensive Zod validation schemas for the messaging system.
 * These schemas ensure data integrity and provide runtime type safety.
 */

import { z } from "zod";
import {
  CONVERSATION_TYPES,
  CONVERSATION_STATUSES,
  MESSAGE_TYPES,
  MESSAGE_STATUSES,
  PARTICIPANT_STATUSES,
  PARTICIPANT_ROLES,
  CONVERSATION_PRIORITIES,
} from "../types/messaging.types";

// =============================================================================
// ENUM SCHEMAS
// =============================================================================

export const conversationTypeSchema = z.enum(CONVERSATION_TYPES);
export const conversationStatusSchema = z.enum(CONVERSATION_STATUSES);
export const messageTypeSchema = z.enum(MESSAGE_TYPES);
export const messageStatusSchema = z.enum(MESSAGE_STATUSES);
export const participantStatusSchema = z.enum(PARTICIPANT_STATUSES);
export const participantRoleSchema = z.enum(PARTICIPANT_ROLES);
export const conversationPrioritySchema = z.enum(CONVERSATION_PRIORITIES);

// =============================================================================
// ATTACHMENT SCHEMAS
// =============================================================================

export const messageAttachmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  url: z.string().url(),
  type: z.string().min(1), // MIME type
  size: z.number().int().min(0).max(100 * 1024 * 1024), // Max 100MB
  thumbnailUrl: z.string().url().optional(),
  uploadedAt: z.string().datetime(),
});

// =============================================================================
// SYSTEM MESSAGE DATA SCHEMAS
// =============================================================================

export const bookingUpdateDataSchema = z.object({
  bookingId: z.string().uuid(),
  previousStatus: z.string().optional(),
  newStatus: z.string().min(1),
  updatedBy: z.string().uuid(),
  reason: z.string().optional(),
});

export const paymentUpdateDataSchema = z.object({
  bookingId: z.string().uuid(),
  paymentStatus: z.string().min(1),
  amount: z.number().optional(),
  currency: z.string().length(3).optional(), // ISO currency code
  paymentMethod: z.string().optional(),
});

export const systemMessageDataSchema = z.union([
  bookingUpdateDataSchema,
  paymentUpdateDataSchema,
  z.record(z.unknown()), // Allow other system message types
]);

// =============================================================================
// CORE SCHEMA DEFINITIONS
// =============================================================================

const conversationSchema = z.object({
  id: z.string().uuid(),
  type: conversationTypeSchema,
  status: conversationStatusSchema,
  bookingId: z.string().uuid().nullable().optional(),
  initiatedBy: z.string().uuid(),
  participantIds: z.array(z.string().uuid()).min(1).max(50), // Reasonable limit
  subject: z.string().max(255).nullable().optional(),
  lastMessageId: z.string().uuid().nullable().optional(),
  lastMessageAt: z.date(),
  lastActivityAt: z.date(),
  messageCount: z.number().int().min(0),
  unreadCount: z.number().int().min(0),
  isLocked: z.boolean(),
  autoCloseAt: z.date().nullable().optional(),
  assignedAdmin: z.string().uuid().nullable().optional(),
  priority: conversationPrioritySchema,
  tags: z.array(z.string().max(50)).max(20).nullable().optional(),
  isArchived: z.boolean(),
  archivedBy: z.string().uuid().nullable().optional(),
  archivedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const messageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1).max(10000), // Reasonable message length limit
  messageType: messageTypeSchema,
  attachments: z.array(messageAttachmentSchema).max(10).nullable().optional(),
  status: messageStatusSchema,
  readBy: z.record(z.string().datetime()), // userId -> timestamp mapping
  readCount: z.number().int().min(0),
  parentMessageId: z.string().uuid().nullable().optional(),
  threadCount: z.number().int().min(0),
  isEdited: z.boolean(),
  editedAt: z.date().nullable().optional(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullable().optional(),
  deletedBy: z.string().uuid().nullable().optional(),
  systemMessageData: systemMessageDataSchema.nullable().optional(),
  isFlagged: z.boolean(),
  flagReason: z.string().max(500).nullable().optional(),
  flaggedBy: z.string().uuid().nullable().optional(),
  flaggedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const conversationParticipantSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  status: participantStatusSchema,
  role: participantRoleSchema,
  isArchived: z.boolean(),
  isMuted: z.boolean(),
  customName: z.string().max(100).nullable().optional(),
  lastReadAt: z.date(),
  lastReadMessageId: z.string().uuid().nullable().optional(),
  unreadCount: z.number().int().min(0),
  notificationsEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  joinedAt: z.date(),
  leftAt: z.date().nullable().optional(),
  updatedAt: z.date(),
});

// =============================================================================
// REQUEST VALIDATION SCHEMAS
// =============================================================================

const createConversationRequestSchema = z.object({
  type: conversationTypeSchema,
  bookingId: z.string().uuid().optional(),
  participantIds: z.array(z.string().uuid())
    .min(1, "At least one participant is required")
    .max(50, "Too many participants"),
  subject: z.string().max(255).optional(),
  initialMessage: z.string().min(1).max(10000).optional(),
});

const sendMessageRequestSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, "Message content is required").max(10000, "Message too long"),
  messageType: messageTypeSchema.default("TEXT"),
  parentMessageId: z.string().uuid().optional(), // For replies
}).refine(
  (data) => {
    // System messages should not be sent via this endpoint
    return !["SYSTEM", "BOOKING_UPDATE", "PAYMENT_UPDATE"].includes(data.messageType);
  },
  {
    message: "System message types cannot be sent manually",
    path: ["messageType"],
  }
);

const updateConversationRequestSchema = z.object({
  subject: z.string().max(255).optional(),
  status: conversationStatusSchema.optional(),
  priority: conversationPrioritySchema.optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isLocked: z.boolean().optional(),
  assignedAdmin: z.string().uuid().nullable().optional(),
});

const updateParticipantRequestSchema = z.object({
  isArchived: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  customName: z.string().max(100).nullable().optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

const markAsReadRequestSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid().optional(), // If provided, mark up to this message as read
});

  const addParticipantRequestSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: participantRoleSchema.default("PARTICIPANT"),
});

const removeParticipantRequestSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
});

// =============================================================================
// QUERY PARAMETER SCHEMAS
// =============================================================================

const conversationFiltersSchema = z.object({
  status: z.array(conversationStatusSchema).optional(),
  type: z.array(conversationTypeSchema).optional(),
  priority: z.array(conversationPrioritySchema).optional(),
  bookingId: z.string().uuid().optional(),
  participantId: z.string().uuid().optional(),
  hasUnread: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().max(255).optional(),
});

const messageFiltersSchema = z.object({
  conversationId: z.string().uuid(),
  messageType: z.array(messageTypeSchema).optional(),
  senderId: z.string().uuid().optional(),
  hasAttachments: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().max(255).optional(),
});

const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20), // Reasonable pagination limits
  cursor: z.string().optional(),
});

// =============================================================================
// ADMIN-SPECIFIC SCHEMAS
// =============================================================================

const adminUpdateConversationRequestSchema = updateConversationRequestSchema.extend({
  // Admins can change additional fields
  type: conversationTypeSchema.optional(),
  isArchived: z.boolean().optional(),
  autoCloseAt: z.date().nullable().optional(),
});

const flagMessageRequestSchema = z.object({
  messageId: z.string().uuid(),
  reason: z.string().min(1, "Flag reason is required").max(500),
});

const moderateMessageRequestSchema = z.object({
  messageId: z.string().uuid(),
  action: z.enum(["DELETE", "UNFLAG", "FLAG"]),
  reason: z.string().max(500).optional(),
});

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

const attachmentUploadSchema = z.object({
  conversationId: z.string().uuid(),
  files: z.array(z.any()).min(1).max(10), // File validation happens at runtime
});

// File type validation (to be used with multer or similar)
export const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const maxFileSize = 10 * 1024 * 1024; // 10MB per file
export const maxTotalSize = 50 * 1024 * 1024; // 50MB total per message

// =============================================================================
// SOCKET EVENT SCHEMAS
// =============================================================================

const socketMessageSchema = z.object({
  type: z.enum(['NEW_MESSAGE', 'MESSAGE_READ', 'USER_TYPING', 'USER_STOPPED_TYPING', 'CONVERSATION_UPDATED']),
  conversationId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  data: z.unknown(),
  timestamp: z.string().datetime(),
});

const typingIndicatorSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  isTyping: z.boolean(),
});

// =============================================================================
// RESPONSE VALIDATION SCHEMAS
// =============================================================================

const conversationListResponseSchema = z.object({
  conversations: z.array(conversationSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
  totalUnread: z.number().int().min(0),
});

const messageListResponseSchema = z.object({
  messages: z.array(messageSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    hasMore: z.boolean(),
  }),
  conversation: conversationSchema,
});

// =============================================================================
// VALIDATION HELPER FUNCTIONS
// =============================================================================

/**
 * Validates if a user can participate in a conversation
 */
export const validateParticipantEligibility = (
  userId: string,
  conversation: z.infer<typeof conversationSchema>,
  userRole: string
) => {
  // Admins can participate in any conversation
  if (userRole === "ADMIN") return true;
  
  // User must be in participant list
  if (!conversation.participantIds.includes(userId)) return false;
  
  // Conversation must not be locked (unless user is admin)
  if (conversation.isLocked) return false;
  
  return true;
};

/**
 * Validates message content based on type
 */
export const validateMessageContent = (content: string, messageType: string) => {
  const schema = z.object({
    content: z.string(),
    messageType: messageTypeSchema,
  });
  
  const result = schema.safeParse({ content, messageType });
  
  if (!result.success) return false;
  
  // Additional validation based on message type
  switch (messageType) {
    case "SYSTEM":
    case "BOOKING_UPDATE":
    case "PAYMENT_UPDATE":
      // System messages have different content requirements
      return true;
    default:
      return content.trim().length > 0 && content.length <= 10000;
  }
};

/**
 * Validates file attachments
 */
export const validateAttachments = (files: File[]) => {
  if (files.length === 0) return { valid: true };
  if (files.length > 10) return { valid: false, error: "Too many attachments" };
  
  let totalSize = 0;
  
  for (const file of files) {
    if (file.size > maxFileSize) {
      return { valid: false, error: `File ${file.name} is too large` };
    }
    
    if (!allowedFileTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} is not allowed` };
    }
    
    totalSize += file.size;
  }
  
  if (totalSize > maxTotalSize) {
    return { valid: false, error: "Total file size exceeds limit" };
  }
  
  return { valid: true };
};

// =============================================================================
// EXPORT ALL SCHEMAS
// =============================================================================

export {
  // Core schemas
  conversationSchema,
  messageSchema,
  conversationParticipantSchema,
  
  // Request schemas
  createConversationRequestSchema,
  sendMessageRequestSchema,
  updateConversationRequestSchema,
  updateParticipantRequestSchema,
  markAsReadRequestSchema,
  
  // Query schemas
  conversationFiltersSchema,
  messageFiltersSchema,
  paginationParamsSchema,
  
  // Admin schemas
  adminUpdateConversationRequestSchema,
  flagMessageRequestSchema,
  moderateMessageRequestSchema,
  
  // Socket schemas
  socketMessageSchema,
  typingIndicatorSchema,
  
  // Response schemas
  conversationListResponseSchema,
  messageListResponseSchema,
};