import { Suspense } from "react";
import { getBookings } from "@/lib/actions/admin/bookings";
import { getInquiries } from "@/lib/actions/admin/inquiries";
import { BookingsTable } from "@/components/admin/bookings/BookingsTable";
import { BookingsTableSkeleton } from "@/components/admin/bookings/BookingsTableSkeleton";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Check, Clock3, Phone, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils/general-utils";

// Constants
const ITEMS_PER_PAGE = 10;

// Types
interface SearchParams {
  tab?: string;
  page?: string;
  inquiryPage?: string;
  inquirySearch?: string;
  inquiryStatus?: string;
}

// This enables automatic revalidation every 30 seconds
export const revalidate = 30;

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams before using its properties (Next.js 15 requirement)
  const resolvedParams = await searchParams;
  
  // Get the active tab from search params or default to "bookings"
  const activeTab = resolvedParams.tab || "bookings";
  
  // Parse and validate page numbers for both tabs
  const currentPage = resolvedParams.page ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const inquiryPage = resolvedParams.inquiryPage ? Math.max(1, parseInt(resolvedParams.inquiryPage)) : 1;
  const limit = ITEMS_PER_PAGE;
  
  // Get filter parameters for inquiries only
  const inquirySearch = resolvedParams.inquirySearch;
  const inquiryStatus = resolvedParams.inquiryStatus;

  return (
    <div className="space-y-5">
      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="bookings" asChild>
            <a href="?tab=bookings">Bookings</a>
          </TabsTrigger>
          <TabsTrigger value="inquiries" asChild>
            <a href="?tab=inquiries">General Inquiries</a>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="space-y-5">
          {/* Bookings Table with Suspense for progressive loading */}
          <Suspense fallback={<BookingsTableSkeleton />}>
            <BookingTableWithData 
              page={currentPage}
              limit={limit}
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="inquiries" className="space-y-5">
          {/* Inquiries Table with Suspense for progressive loading */}
          <Suspense fallback={<InquiriesTableSkeleton />}>
            <InquiryTableWithData 
              page={inquiryPage}
              limit={limit}
              search={inquirySearch}
              status={inquiryStatus}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate component for bookings data fetching to enable Suspense
async function BookingTableWithData({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { bookings, totalCount, totalPages } = await getBookings({
    page,
    limit
  });

  return (
    <>
      {/* Bookings List */}
      <BookingsTable bookings={bookings} />

      {/* Pagination */}
      {totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={limit}
          searchParams={{ tab: "bookings" }}
          baseUrl="/admin/bookings"
          itemName="bookings"
        />
      )}
    </>
  );
}

// Separate component for inquiries data fetching to enable Suspense
async function InquiryTableWithData({
  page,
  limit,
  search,
  status
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  const inquiriesData = await getInquiries({
    page,
    limit,
    status,
    search,
  });

  return (
    <>
      {/* Inquiries List */}
      <InquiriesTable inquiries={inquiriesData.inquiries} />

      {/* Pagination */}
      {inquiriesData.totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={inquiriesData.totalPages}
          totalCount={inquiriesData.totalCount}
          itemsPerPage={limit}
          searchParams={{ inquirySearch: search, inquiryStatus: status, tab: "inquiries" }}
          baseUrl="/admin/bookings"
          itemName="inquiries"
        />
      )}
    </>
  );
}

// Simple inquiries table component (keeping it in same file for simplicity)
function InquiriesTable({ inquiries }: { inquiries: any[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 bg-gray-50 border-b">
        <CardTitle className="text-lg">General Inquiries</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No inquiries found.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">
                    <span className="font-mono text-xs">
                      {inquiry.id.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inquiry.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span>{inquiry.email}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{inquiry.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {inquiry.guests && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Guests:</span> {inquiry.guests}
                        </div>
                      )}
                      {inquiry.budget && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Budget:</span> {inquiry.budget}
                        </div>
                      )}
                      {inquiry.date && (
                        <div className="flex items-center gap-1">
                          <CalendarCheck className="h-3 w-3 text-gray-500" />
                          <span>{formatDate(inquiry.date)}</span>
                          {inquiry.time && <span> at {inquiry.time}</span>}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <InquiryStatusBadge status={inquiry.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Inquiry</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Simple inquiries skeleton component
function InquiriesTableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 bg-gray-50 border-b">
        <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-16 bg-gray-200 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-gray-200 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 animate-pulse rounded" /></TableCell>
                <TableCell className="text-right"><div className="h-8 w-8 bg-gray-200 animate-pulse rounded ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InquiryStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "CONTACTED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Phone className="h-3 w-3 mr-1" />
          Contacted
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          Archived
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
} 