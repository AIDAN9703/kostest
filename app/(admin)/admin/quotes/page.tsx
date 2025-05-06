import { Metadata } from "next";
import { CopyCheck, Download, FilePlus, Filter, MoreHorizontal, Search, SlidersHorizontal } from "lucide-react";
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

export const metadata: Metadata = {
  title: "Quote Generator | Admin Dashboard",
  description: "Generate and manage customer quotes",
};

// Mock data
const quotes = [
  {
    id: "Q12345",
    customer: {
      name: "John Smith",
      email: "john@example.com",
      avatar: "/avatars/01.png",
    },
    boat: {
      name: "Ocean Explorer",
      id: "boat-123",
    },
    date: "2023-08-15",
    totalAmount: 1250,
    status: "SENT",
    expiresAt: "2023-08-30",
    createdAt: "2023-08-01T10:30:00Z",
  },
  {
    id: "Q12346",
    customer: {
      name: "Jane Cooper",
      email: "jane@example.com",
      avatar: "/avatars/02.png",
    },
    boat: {
      name: "Royal Voyager",
      id: "boat-124",
    },
    date: "2023-08-18",
    totalAmount: 1850,
    status: "DRAFT",
    expiresAt: "2023-09-02",
    createdAt: "2023-08-02T14:20:00Z",
  },
  {
    id: "Q12347",
    customer: {
      name: "Michael Johnson",
      email: "michael@example.com",
      avatar: "/avatars/03.png",
    },
    boat: {
      name: "Paradise Cruiser",
      id: "boat-125",
    },
    date: "2023-08-20",
    totalAmount: 3200,
    status: "ACCEPTED",
    expiresAt: "2023-09-04",
    createdAt: "2023-08-05T09:45:00Z",
  },
  {
    id: "Q12348",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/avatars/04.png",
    },
    boat: {
      name: "Coastal Dream",
      id: "boat-126",
    },
    date: "2023-08-25",
    totalAmount: 1500,
    status: "EXPIRED",
    expiresAt: "2023-08-10",
    createdAt: "2023-07-10T16:15:00Z",
  },
  {
    id: "Q12349",
    customer: {
      name: "Robert Wilson",
      email: "robert@example.com",
      avatar: "/avatars/05.png",
    },
    boat: {
      name: "Sea Breeze",
      id: "boat-127",
    },
    date: "2023-09-01",
    totalAmount: 2100,
    status: "REJECTED",
    expiresAt: "2023-09-15",
    createdAt: "2023-08-15T11:30:00Z",
  },
];

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quote Generator</h1>
        <Button>
          <FilePlus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <QuickStatCard title="Total Quotes" value="127" trend="+12% from last month" />
        <QuickStatCard title="Accepted" value="84" trend="+8% from last month" />
        <QuickStatCard title="Pending" value="32" trend="+4% from last month" />
        <QuickStatCard title="Conversion Rate" value="66%" trend="+2% from last month" />
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">All Quotes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input 
                  placeholder="Search quotes..." 
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
                  <DropdownMenuItem>All Quotes</DropdownMenuItem>
                  <DropdownMenuItem>Draft Quotes</DropdownMenuItem>
                  <DropdownMenuItem>Sent Quotes</DropdownMenuItem>
                  <DropdownMenuItem>Accepted Quotes</DropdownMenuItem>
                  <DropdownMenuItem>Expired Quotes</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Created This Month</DropdownMenuItem>
                  <DropdownMenuItem>Created Last Month</DropdownMenuItem>
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
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    {quote.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="font-medium">{quote.customer.name}</div>
                        <div className="text-xs text-gray-500">{quote.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{quote.boat.name}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(quote.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(quote.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(quote.expiresAt).toLocaleDateString()}
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
                        <DropdownMenuItem>View Quote</DropdownMenuItem>
                        <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CopyCheck className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Quote</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing <strong>5</strong> of <strong>127</strong> quotes
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuoteStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          Draft
        </Badge>
      );
    case "SENT":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Sent
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Accepted
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Rejected
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Expired
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

function QuickStatCard({ title, value, trend }: { title: string, value: string, trend: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{title}</p>
        <div className="text-xs text-green-600 mt-2">{trend}</div>
      </CardContent>
    </Card>
  );
} 