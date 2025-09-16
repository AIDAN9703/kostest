import { PricingTier } from "./types";

/**
 * Base booking data - core fields used across all booking contexts
 */
export interface BaseBookingData {
  startDateTime: string;
  numberOfPassengers: number;
  needsCaptain: boolean;
  specialRequests?: string;
}

/**
 * Form-specific booking data - what the user fills out
 */
export interface BookingFormData extends BaseBookingData {
  pricingTierId: string;
}

/**
 * Complete booking data with boat and pricing info
 */
export interface BookingWithDetails extends BaseBookingData {
  boatId: string;
  boat: SafeBoatData;
  selectedTier: PricingTier;
}

/**
 * Safe boat data for booking contexts (minimal boat info)
 */
export interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
  locationLabel: string | null;
  timezone?: string | null; // Required for proper boat time display
}

/**
 * Database booking record (from admin/backend contexts)
 */
export interface DatabaseBooking {
  id: string;
  bookingType: string;
  bookingStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDateTime: Date | null;
  endDateTime: Date | null;
  numberOfPassengers: number;
  totalAmount: number;
  paymentStatus: string | null;
  paymentMethod: string | null;
  needsCaptain: boolean | null;
  specialRequests: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Boat information (from joins)
  boatId: string;
  boatName: string | null;
  boatCategory: string | null;
  boatMainImage: string | null;
  
  // User information (from joins, if applicable)
  userId: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userProfileImage: string | null;
}

/**
 * Calendar event data for admin calendars
 */
export interface BookingCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    // Discriminator for event kind (admin calendars may include external blocks)
    type?: 'booking' | 'external';
    // Present when type === 'booking'
    bookingId?: string;
    // Present when type === 'external'
    source?: string;
    eventId?: string;

    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bookingStatus: string;
    bookingType: string;
    numberOfPassengers: number;
    totalAmount: number;
    specialRequests: string;
    startTime: string; // Local timezone for display
    endTime: string;   // Local timezone for display
    createdAt: string;
    boatId?: string;
    boatName?: string;
  };
}

/**
 * Profile page booking display format
 */
export interface ProfileBooking {
  id: string;
  boatName: string;
  boatType: string;
  date: string;
  duration: number;
  location: string;
  guests: number;
  captain: boolean | null;
  price: number;
  status: string;
  image: string;
} 