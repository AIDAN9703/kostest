import { InquiriesTable } from "@/features-admin/inquiries/components/InquiriesTable";
import { DataTablePagination } from "@/shared/layouts/DataTablePagination";

interface InquiriesTabProps {
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
  inquiriesData: {
    inquiries: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export function InquiriesTab({ searchParams, filters, inquiriesData }: InquiriesTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InquiryStatsCards />
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">General Inquiries</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer inquiries and booking requests
          </p>
        </div>
        
        <div className="p-6">
          <InquiriesTable inquiries={inquiriesData.inquiries} />
        </div>
        
        {inquiriesData.totalPages > 1 && (
          <div className="px-6 pb-6">
            <DataTablePagination
              currentPage={inquiriesData.page}
              totalPages={inquiriesData.totalPages}
              totalCount={inquiriesData.totalCount}
              itemsPerPage={inquiriesData.limit}
              searchParams={{ search: filters.search, status: filters.status }}
              baseUrl="/admin/bookings/portal"
              itemName="inquiries"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Stats component - now synchronous
function InquiryStatsCards() {
  // We'll implement this later with real stats
  const stats = [
    { label: "Total Inquiries", value: "0", color: "purple" },
    { label: "Pending", value: "0", color: "amber" },
    { label: "Contacted", value: "0", color: "blue" },
    { label: "Resolved", value: "0", color: "emerald" },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              stat.color === 'purple' ? 'bg-purple-50 border border-purple-200' :
              stat.color === 'amber' ? 'bg-amber-50 border border-amber-200' :
              stat.color === 'blue' ? 'bg-blue-50 border border-blue-200' :
              'bg-emerald-50 border border-emerald-200'
            }`}>
              <div className={`w-6 h-6 rounded ${
                stat.color === 'purple' ? 'bg-purple-500' :
                stat.color === 'amber' ? 'bg-amber-500' :
                stat.color === 'blue' ? 'bg-blue-500' :
                'bg-emerald-500'
              }`}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

