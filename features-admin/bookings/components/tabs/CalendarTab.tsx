import { Suspense } from "react";
import { CalendarView } from "@/features-admin/bookings/components/CalendarView";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface CalendarTabProps {
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
  bookingsData?: {
    bookings: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export function CalendarTab({ searchParams, filters, bookingsData }: CalendarTabProps) {
  const currentDate = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Today
          </Button>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Booking Status Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Inquiries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarView filters={filters} bookingsData={bookingsData} />
        </Suspense>
      </div>
    </div>
  );
}

// Calendar loading skeleton
function CalendarSkeleton() {
  return (
    <div className="p-6">
      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}