import { Metadata } from "next";
import { CalendarCheck, Check, Clock3, CreditCard, Filter, Mail, MessageCircle, MoreHorizontal, Phone, Search, SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/general-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInquiries, updateInquiryStatus } from "@/lib/actions/admin/inquiries";
import { redirect } from "next/navigation";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

export const metadata: Metadata = {
  title: "Bookings & Inquiries | Admin Dashboard",
  description: "Manage bookings and customer inquiries on the platform",
};

// Constants
const ITEMS_PER_PAGE = 10;

// Types
interface SearchParams {
  tab?: string;
  page?: string;
  inquiryPage?: string;
  inquiryStatus?: string;
  inquirySearch?: string;
  updateInquiry?: string;
  status?: string;
  search?: string;
}

// Mock data
const bookings = [
  {
    id: "B12345",
    customer: {
      name: "John Smith",
      email: "john@example.com",
      avatar: "/avatars/01.png",
    },
    boat: {
      name: "Ocean Explorer",
      id: "boat-123",
    },
    startDate: "2023-08-15",
    endDate: "2023-08-16",
    status: "CONFIRMED",
    totalAmount: 1250,
    paymentStatus: "PAID",
    createdAt: "2023-08-01T10:30:00Z",
  },
  {
    id: "B12346",
    customer: {
      name: "Jane Cooper",
      email: "jane@example.com",
      avatar: "/avatars/02.png",
    },
    boat: {
      name: "Royal Voyager",
      id: "boat-124",
    },
    startDate: "2023-08-18",
    endDate: "2023-08-19",
    status: "PENDING",
    totalAmount: 1850,
    paymentStatus: "PENDING",
    createdAt: "2023-08-02T14:20:00Z",
  },
  {
    id: "B12347",
    customer: {
      name: "Michael Johnson",
      email: "michael@example.com",
      avatar: "/avatars/03.png",
    },
    boat: {
      name: "Paradise Cruiser",
      id: "boat-125",
    },
    startDate: "2023-08-20",
    endDate: "2023-08-22",
    status: "COMPLETED",
    totalAmount: 3200,
    paymentStatus: "PAID",
    createdAt: "2023-08-05T09:45:00Z",
  },
  {
    id: "B12348",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/avatars/04.png",
    },
    boat: {
      name: "Coastal Dream",
      id: "boat-126",
    },
    startDate: "2023-08-25",
    endDate: "2023-08-26",
    status: "CANCELLED",
    totalAmount: 1500,
    paymentStatus: "REFUNDED",
    createdAt: "2023-08-10T16:15:00Z",
  },
  {
    id: "B12349",
    customer: {
      name: "Robert Wilson",
      email: "robert@example.com",
      avatar: "/avatars/05.png",
    },
    boat: {
      name: "Sea Breeze",
      id: "boat-127",
    },
    startDate: "2023-09-01",
    endDate: "2023-09-02",
    status: "CONFIRMED",
    totalAmount: 2100,
    paymentStatus: "PAID",
    createdAt: "2023-08-15T11:30:00Z",
  },
];

// Helper function to format date
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Not available";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function BookingsPage({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams>;
}) {
  // Await the searchParams promise
  const resolvedParams = await searchParams;
  
  // Handle inquiry status update if parameters are present
  if (resolvedParams.updateInquiry && resolvedParams.status) {
    const inquiryId = resolvedParams.updateInquiry;
    const newStatus = resolvedParams.status;
    
    try {
      await updateInquiryStatus(inquiryId, {
        status: newStatus,
        notes: `Status updated to ${newStatus} via admin dashboard`
      });
      
      // Redirect back to the inquiries tab without the update parameters
      const searchQuery = new URLSearchParams();
      searchQuery.set('tab', 'inquiries');
      if (resolvedParams.inquiryStatus) searchQuery.set('inquiryStatus', resolvedParams.inquiryStatus);
      if (resolvedParams.inquirySearch) searchQuery.set('inquirySearch', resolvedParams.inquirySearch);
      if (resolvedParams.inquiryPage) searchQuery.set('inquiryPage', resolvedParams.inquiryPage);
      
      redirect(`/admin/bookings?${searchQuery.toString()}`);
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      // Continue rendering the page with the error
    }
  }
  
  // Get the active tab from search params or default to "bookings"
  const activeTab = resolvedParams.tab || "bookings";
  
  // Parse and validate page numbers
  const currentPage = resolvedParams.page ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const inquiryPage = resolvedParams.inquiryPage ? Math.max(1, parseInt(resolvedParams.inquiryPage)) : 1;
  
  // Get search and filter parameters
  const search = resolvedParams.search;
  const inquiryStatus = resolvedParams.inquiryStatus;
  const inquirySearch = resolvedParams.inquirySearch;
  
  // Fetch inquiries data if on inquiries tab
  const inquiriesData = await getInquiries({
    page: inquiryPage,
    limit: ITEMS_PER_PAGE,
    status: inquiryStatus,
    search: inquirySearch,
  });

  // Mock pagination data for bookings (replace with actual data)
  const bookingsData = {
    bookings,
    totalCount: 42,
    totalPages: 5
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="hidden sm:flex">
          Export Report
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="bookings" asChild>
            <a href="?tab=bookings">Bookings</a>
          </TabsTrigger>
          <TabsTrigger value="inquiries" asChild>
            <a href="?tab=inquiries">General Inquiries</a>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">All Bookings</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input 
                      placeholder="Search bookings..." 
                      className="w-full sm:w-[200px] pl-9"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="sr-only">View options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>View Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Confirmed Bookings</DropdownMenuItem>
                      <DropdownMenuItem>Pending Bookings</DropdownMenuItem>
                      <DropdownMenuItem>Cancelled Bookings</DropdownMenuItem>
                      <DropdownMenuItem>Completed Bookings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>This Month</DropdownMenuItem>
                      <DropdownMenuItem>Last Month</DropdownMenuItem>
                      <DropdownMenuItem>Custom Range...</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Boat</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="font-medium">{booking.customer.name}</div>
                            <div className="text-xs text-gray-500">{booking.customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.boat.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarCheck className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(booking.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={booking.paymentStatus} />
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
                            <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Bookings Pagination */}
              {bookingsData.totalPages > 1 && (
                <DataTablePagination
                  currentPage={currentPage}
                  totalPages={bookingsData.totalPages}
                  totalCount={bookingsData.totalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  searchParams={{
                    search,
                    status: resolvedParams.status
                  }}
                  baseUrl="/admin/bookings"
                  itemName="bookings"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inquiries" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">General Inquiries</CardTitle>
                <div className="flex items-center gap-2">
                  <form className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input 
                      name="inquirySearch"
                      placeholder="Search name or email..." 
                      className="w-full sm:w-[200px] pl-9"
                      defaultValue={inquirySearch}
                    />
                  </form>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">Filter by status</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>All Inquiries</DropdownMenuItem>
                      <DropdownMenuItem>New</DropdownMenuItem>
                      <DropdownMenuItem>In Progress</DropdownMenuItem>
                      <DropdownMenuItem>Resolved</DropdownMenuItem>
                      <DropdownMenuItem>Closed</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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
                  {inquiriesData.inquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No inquiries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inquiriesData.inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-medium">
                          {inquiry.id.slice(0, 8)}...
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
              
              {/* Inquiries Pagination */}
              {inquiriesData.totalPages > 1 && (
                <DataTablePagination
                  currentPage={inquiryPage}
                  totalPages={inquiriesData.totalPages}
                  totalCount={inquiriesData.totalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  searchParams={{
                    inquirySearch,
                    inquiryStatus
                  }}
                  baseUrl="/admin/bookings"
                  itemName="inquiries"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "CONFIRMED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <X className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Check className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CreditCard className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CreditCard className="h-3 w-3 mr-1" />
          Refunded
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
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