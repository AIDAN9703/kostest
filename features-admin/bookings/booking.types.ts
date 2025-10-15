/**
 * Application-level types for bookings
 * These extend or derive from the base database types
 */

/**
 * Booking list item - optimized for table display
 * Note: Dates come as ISO strings from the API, not Date objects
 */
export interface BookingListItem {
  // Booking core fields
  id: string;
  bookingType: string;
  bookingStatus: string;
  paymentStatus: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  startDateTime: Date | string | null; // Can be Date from DB or string from API
  endDateTime: Date | string | null; // Can be Date from DB or string from API
  numberOfPassengers: number | null;
  totalAmount: number | null;
  needsCaptain: boolean | null;
  createdAt: Date | string | null; // Can be Date from DB or string from API
  
  // Joined boat info
  boatId: string | null;
  boatName: string | null;
  boatCategory: string | null;
  boatMainImage: string | null;
  
  // Joined user info
  userId: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userProfileImage: string | null;
}

/**
 * Paginated bookings response
 */
export interface PaginatedBookingsResponse {
  bookings: BookingListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Booking statistics
 */
export interface BookingStats {
  total: number;
  totalRevenue: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

