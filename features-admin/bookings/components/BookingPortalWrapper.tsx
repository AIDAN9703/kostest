import { BookingPortal } from "./BookingPortal";

interface BookingPortalWrapperProps {
  searchParams: {
    tab?: string;
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    boat?: string;
    customer?: string;
  };
  bookingsData: {
    bookings: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  inquiriesData: {
    inquiries: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export function BookingPortalWrapper({ 
  searchParams, 
  bookingsData, 
  inquiriesData 
}: BookingPortalWrapperProps) {
  return (
    <BookingPortal 
      searchParams={searchParams} 
      bookingsData={bookingsData}
      inquiriesData={inquiriesData}
    />
  );
}