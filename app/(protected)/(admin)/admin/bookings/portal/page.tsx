import { Suspense } from "react";
import { BookingPortalWrapper } from "@/features-admin/bookings/components/BookingPortalWrapper";
import { BookingPortalSkeleton } from "@/features-admin/bookings/components/BookingPortalSkeleton";
import { getBookings } from "@/features-admin/bookings/actions/bookings";
import { getInquiries } from "@/features-admin/bookings/actions/inquiries";

// Types
type BookingStatus = 'PENDING' | 'EXPIRED' | 'APPROVED' | 'CONFIRMED' | 'DENIED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';

// Helper to validate booking status
function isValidBookingStatus(status: string | undefined): status is BookingStatus {
  if (!status) return false;
  return ['PENDING', 'EXPIRED', 'APPROVED', 'CONFIRMED', 'DENIED', 'CANCELLED', 'COMPLETED', 'REFUNDED'].includes(status);
}

interface SearchParams {
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
}

// This enables automatic revalidation every 30 seconds
export const revalidate = 30;

export default async function BookingPortalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams before using its properties (Next.js 15 requirement)
  const resolvedParams = await searchParams;
  
  // Parse pagination
  const currentPage = resolvedParams.page ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const limit = resolvedParams.limit ? Math.max(10, Math.min(100, parseInt(resolvedParams.limit))) : 10;
  
  // Fetch data based on active tab
  const activeTab = resolvedParams.tab || "all";
  
  // Prepare filter values (convert 'all' back to undefined for database queries)
  const searchFilter = resolvedParams.search || undefined;
  const statusFilter = resolvedParams.status === 'all' ? undefined : 
    (isValidBookingStatus(resolvedParams.status) ? resolvedParams.status : undefined);
  const typeFilter = resolvedParams.type === 'all' ? undefined : resolvedParams.type;
  
  // Fetch data for all tabs to avoid loading states when switching
  const [bookingsData, inquiriesData] = await Promise.all([
    getBookings({
      page: activeTab === "all" ? currentPage : 1,
      limit: activeTab === "all" ? limit : 10,
      search: activeTab === "all" ? searchFilter : undefined,
      status: activeTab === "all" ? statusFilter : undefined,
      dateFrom: activeTab === "all" ? resolvedParams.dateFrom : undefined,
      dateTo: activeTab === "all" ? resolvedParams.dateTo : undefined,
      boat: activeTab === "all" ? resolvedParams.boat : undefined,
      customer: activeTab === "all" ? resolvedParams.customer : undefined,
    }),
    getInquiries({
      page: activeTab === "inquiries" ? currentPage : 1,
      limit: activeTab === "inquiries" ? limit : 10,
      search: activeTab === "inquiries" ? searchFilter : undefined,
      status: activeTab === "inquiries" ? statusFilter : undefined,
      dateFrom: activeTab === "inquiries" ? resolvedParams.dateFrom : undefined,
      dateTo: activeTab === "inquiries" ? resolvedParams.dateTo : undefined,
    })
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all bookings, inquiries, and calendar events in one place
        </p>
      </div>

      {/* Unified Booking Portal */}
      <BookingPortalWrapper 
        searchParams={resolvedParams} 
        bookingsData={bookingsData}
        inquiriesData={inquiriesData}
      />
    </div>
  );
}
