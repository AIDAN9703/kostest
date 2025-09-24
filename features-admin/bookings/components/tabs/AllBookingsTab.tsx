import { BookingsTable } from "@/features-admin/bookings/components/BookingsTable";
import { DataTablePagination } from "@/features-admin/_layout/DataTablePagination";

interface AllBookingsTabProps {
  searchParams: {
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
  filters: {
    search: string;
    status: string;
    type: string;
    dateFrom: string;
    dateTo: string;
    boat: string;
    customer: string;
  };
  bookingsData: {
    bookings: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export function AllBookingsTab({ searchParams, filters, bookingsData }: AllBookingsTabProps) {
  return (
    <div className="space-y-6">

      {/* Bookings Table */}
        
        <div className="">
          <BookingsTable bookings={bookingsData.bookings} />
        </div>
        
        {bookingsData.totalPages > 1 && (
          <div className="px-6 pb-6">
            <DataTablePagination
              currentPage={bookingsData.page}
              totalPages={bookingsData.totalPages}
              totalCount={bookingsData.totalCount}
              itemsPerPage={bookingsData.limit}
              searchParams={filters}
              baseUrl="/admin/bookings/portal"
              itemName="bookings"
            />
          </div>
        )}
    </div>
  );
}
