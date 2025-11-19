/**
 * Application-level types for bookings
 * Dates are Date objects everywhere (SuperJSON handles serialization)
 */

export interface BookingListItem {
  id: string;
  bookingType: string;
  bookingStatus: string;
  paymentStatus: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  startDateTime: Date; // NOT NULL in database
  endDateTime: Date | null; // Nullable in database
  numberOfPassengers: number; // NOT NULL in database
  totalAmount: number; // NOT NULL in database
  needsCaptain: boolean | null;
  createdAt: Date; // NOT NULL in database
  
  boatId: string | null;
  boatName: string | null;
  boatCategory: string | null;
  boatMainImage: string | null;
  
  userId: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userProfileImage: string | null;
  
  assignedAdminId: string | null;
  assignedAdminFirstName: string | null;
  assignedAdminLastName: string | null;
  assignedAdminEmail: string | null;
  contactedAt: Date | null;
}

export interface BookingDetails extends BookingListItem {
  paymentMethod: string | null;
  specialRequests: string | null;
  updatedAt: Date; // NOT NULL in database
  captainFee: number | null;
  cleaningFee: number | null;
  serviceFee: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  depositAmount: number | null;
  refundAmount: number | null;
  currency: string | null;
  paymentDueDate: Date | null;
  depositPaid: boolean | null;
  isMultiDay: boolean | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  expiresAt: Date | null;
  
  boatCapacity: number | null;
  boatOwnerId: string | null;
  boatOwnerFirstName: string | null;
  boatOwnerLastName: string | null;
  boatOwnerEmail: string | null;
  
  assignedAdminId: string | null;
  assignedAdminFirstName: string | null;
  assignedAdminLastName: string | null;
  assignedAdminEmail: string | null;
  contactedAt: Date | null;
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

