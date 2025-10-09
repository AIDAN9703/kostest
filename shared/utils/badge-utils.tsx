/**
 * Shared Badge Utilities
 * 
 * This file contains reusable badge styling utilities for consistent
 * status badges across the entire application.
 */

import { cn } from "@/shared/utils/general-utils";

// Badge style configurations
export const BADGE_STYLES = {
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  yellow: "bg-yellow-50 text-yellow-700",
  blue: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
  gray: "bg-gray-100 text-gray-700",
  amber: "bg-amber-50 text-amber-700",
  navy: "bg-slate-50 text-slate-700",
} as const;

export type BadgeColor = keyof typeof BADGE_STYLES;

// Status color mappings
export const STATUS_COLORS = {
  // User Status
  ACTIVE: "green",
  INACTIVE: "gray",
  SUSPENDED: "red",
  PENDING_VERIFICATION: "yellow",
  BANNED: "red",
  
  // Booking Status
  PENDING: "yellow",
  APPROVED: "blue",
  AWAITING_PAYMENT: "blue",
  CONFIRMED: "green",
  DENIED: "red",
  CANCELLED: "red",
  COMPLETED: "purple",
  EXPIRED: "gray",
  REFUNDED: "amber",
  
  // Payment Status
  PAID: "green",
  FAILED: "red",
  CHARGEBACK: "red",
  
  // Quote Status
  DRAFT: "gray",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  
  // Boolean Status
  true: "green",
  false: "gray",
  
  // Special Status
  FEATURED: "amber",
} as const;

// User Role colors
export const ROLE_COLORS = {
  USER: "blue",
  ADMIN: "purple",
  CAPTAIN: "navy",
  BROKER: "green",
  OWNER: "amber",
} as const;

/**
 * Get badge style classes for a given status
 */
export function getStatusBadgeClass(status: string | boolean | undefined | null): string {
  if (status === null || status === undefined) return BADGE_STYLES.gray;
  
  // Handle boolean values directly
  if (typeof status === "boolean") {
    return status ? BADGE_STYLES.green : BADGE_STYLES.gray;
  }
  
  const statusKey = String(status).toUpperCase();
  const color = (STATUS_COLORS as any)[statusKey] || "gray";
  return BADGE_STYLES[color as BadgeColor];
}

/**
 * Get badge style classes for a given role
 */
export function getRoleBadgeClass(role: string | undefined | null): string {
  if (!role) return BADGE_STYLES.gray;
  
  const roleKey = role.toUpperCase();
  const color = (ROLE_COLORS as any)[roleKey] || "blue";
  return BADGE_STYLES[color as BadgeColor];
}

/**
 * Format status text for display (replace underscores with spaces, capitalize)
 */
export function formatStatusText(status: string | boolean | undefined | null): string {
  if (status === null || status === undefined) return "Unknown";
  if (typeof status === "boolean") return status ? "Active" : "Inactive";
  
  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Reusable StatusBadge component
 */
interface StatusBadgeProps {
  status: string | boolean | undefined | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        getStatusBadgeClass(status),
        className
      )}
    >
      {formatStatusText(status)}
    </span>
  );
}

/**
 * Reusable RoleBadge component
 */
interface RoleBadgeProps {
  role: string | undefined | null;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        getRoleBadgeClass(role),
        className
      )}
    >
      {formatStatusText(role)}
    </span>
  );
}

