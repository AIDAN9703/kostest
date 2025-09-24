// Constants for admin field dropdown options using database schema enums
import { 
  bookingStatusEnum,
  paymentStatusEnum,
  boatCategoryEnum,
  userStatusEnum,
  userRoleEnum
} from "@/database/schema";

// Type definitions for field options
export interface FieldOption {
  value: string | boolean;
  label: string;
  color?: string;
}

export interface FieldConfig {
  label: string;
  options: FieldOption[];
}

export interface EntityFieldConfig {
  [fieldName: string]: FieldConfig;
}

// Helper function to format enum values to readable labels
function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to create options from enum with optional color mapping
function createEnumOptions(
  enumValues: readonly string[], 
  colorMap?: Record<string, string>
): FieldOption[] {
  return enumValues.map(value => ({
    value,
    label: formatEnumLabel(value),
    color: colorMap?.[value]
  }));
}

// Color mappings for different status types
const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "yellow",
  APPROVED: "blue", 
  AWAITING_PAYMENT: "blue",
  CONFIRMED: "green",
  DENIED: "red",
  CANCELLED: "red",
  COMPLETED: "purple",
  EXPIRED: "gray",
  REFUNDED: "orange"
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "yellow",
  PAID: "green",
  FAILED: "red",
  REFUNDED: "orange",
  CHARGEBACK: "red"
};

const USER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "green",
  INACTIVE: "gray",
  SUSPENDED: "red",
  PENDING_VERIFICATION: "yellow",
  BANNED: "red"
};

const USER_ROLE_COLORS: Record<string, string> = {
  USER: "blue",
  ADMIN: "purple",
  CAPTAIN: "navy",
  BROKER: "green",
  OWNER: "gold"
};

// Boolean options for true/false fields
const ACTIVE_STATUS_OPTIONS: FieldOption[] = [
  { value: true, label: "Active", color: "green" },
  { value: false, label: "Inactive", color: "red" }
];

const FEATURED_OPTIONS: FieldOption[] = [
  { value: true, label: "Featured", color: "gold" },
  { value: false, label: "Not Featured", color: "gray" }
];

const INSTANT_BOOK_OPTIONS: FieldOption[] = [
  { value: true, label: "Enabled", color: "green" },
  { value: false, label: "Disabled", color: "gray" }
];

// Main field options configuration using schema enums
export const ADMIN_FIELD_DROPDOWN_OPTIONS: Record<string, EntityFieldConfig> = {
  booking: {
    bookingStatus: {
      label: "Booking Status",
      options: createEnumOptions(bookingStatusEnum.enumValues, BOOKING_STATUS_COLORS)
    },
    paymentStatus: {
      label: "Payment Status", 
      options: createEnumOptions(paymentStatusEnum.enumValues, PAYMENT_STATUS_COLORS)
    }
  },
  
  inquiry: {
    status: {
      label: "Inquiry Status",
      options: [
        { value: "PENDING", label: "Pending", color: "yellow" },
        { value: "CONTACTED", label: "Contacted", color: "blue" },
        { value: "RESOLVED", label: "Resolved", color: "green" },
        { value: "ARCHIVED", label: "Archived", color: "gray" }
      ]
    }
  },
  
  boat: {
    active: {
      label: "Active Status",
      options: ACTIVE_STATUS_OPTIONS
    },
    featured: {
      label: "Featured Status", 
      options: FEATURED_OPTIONS
    },
    category: {
      label: "Boat Category",
      options: createEnumOptions(boatCategoryEnum.enumValues)
    },
    instantBook: {
      label: "Instant Book",
      options: INSTANT_BOOK_OPTIONS
    }
  },
  
  user: {
    status: {
      label: "User Status",
      options: createEnumOptions(userStatusEnum.enumValues, USER_STATUS_COLORS)
    },
    role: {
      label: "User Role", 
      options: createEnumOptions(userRoleEnum.enumValues, USER_ROLE_COLORS)
    }
  }
};  