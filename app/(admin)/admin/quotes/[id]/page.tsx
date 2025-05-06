import { Metadata } from "next";
import { Check, Clock, CopyCheck, Download, Edit, MessageSquare, Printer, Ship, User, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/general-utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quote Details | Admin Dashboard",
  description: "View and manage quote details",
};

// Mock data for a single quote
const quote = {
  id: "Q12345",
  status: "SENT",
  customer: {
    id: "user-123",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/avatars/01.png",
  },
  boat: {
    id: "boat-123",
    name: "Ocean Explorer",
    category: "YACHT",
    owner: {
      id: "user-456",
      name: "Captain Mike",
      email: "mike@example.com",
    },
  },
  details: {
    date: "2023-08-15",
    startTime: "10:00",
    endTime: "18:00",
    numberOfHours: 8,
    numberOfPassengers: 6,
    location: "Miami Beach Marina",
    destination: "Biscayne Bay Cruise",
    specialRequests: "Customer requested ice and drinks to be available. Will bring own food.",
    includesCaptain: true,
    includesFuel: true,
    includesInsurance: true,
  },
  pricing: {
    basePrice: 1000,
    captainFee: 150,
    cleaningFee: 50,
    serviceFee: 50,
    taxAmount: 100,
    totalAmount: 1350,
    depositAmount: 200,
  },
  dates: {
    createdAt: "2023-08-01T10:30:00Z",
    expiresAt: "2023-08-30T23:59:59Z",
    lastUpdatedAt: "2023-08-01T14:20:00Z",
    sentAt: "2023-08-01T14:30:00Z",
  },
  notes: "Offer 10% discount for booking within the next 48 hours.",
};

export default function QuoteDetailsPage({ params }: { params: { id: string } }) {
  const isExpired = new Date(quote.dates.expiresAt) < new Date();
  const daysUntilExpiry = Math.ceil((new Date(quote.dates.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quote #{params.id}</h1>
          <p className="text-gray-500 mt-1">
            Created on {new Date(quote.dates.createdAt).toLocaleDateString()} at {new Date(quote.dates.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Quote
          </Button>
        </div>
      </div>
      
      {/* Status Banner */}
      <Card className={`${isExpired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center">
            {isExpired ? (
              <X className="h-5 w-5 text-red-600 mr-2" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600 mr-2" />
            )}
            <div>
              <p className={`font-medium ${isExpired ? 'text-red-700' : 'text-amber-700'}`}>
                {isExpired ? 'This quote has expired' : `Expires in ${daysUntilExpiry} days`}
              </p>
              <p className="text-sm text-gray-600">
                {isExpired 
                  ? 'This quote is no longer valid for booking'
                  : `Valid until ${new Date(quote.dates.expiresAt).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
          {isExpired && (
            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
              <CopyCheck className="h-4 w-4 mr-2" />
              Create New Quote
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Quote Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Quote Details</CardTitle>
                <QuoteStatusBadge status={quote.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1">{new Date(quote.details.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="mt-1">{quote.details.startTime} - {quote.details.endTime} ({quote.details.numberOfHours} hours)</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Number of Passengers</h3>
                  <p className="mt-1">{quote.details.numberOfPassengers}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1">{quote.details.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Destination</h3>
                  <p className="mt-1">{quote.details.destination}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Includes</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {quote.details.includesCaptain && (
                      <Badge variant="outline" className="bg-blue-50">Captain</Badge>
                    )}
                    {quote.details.includesFuel && (
                      <Badge variant="outline" className="bg-green-50">Fuel</Badge>
                    )}
                    {quote.details.includesInsurance && (
                      <Badge variant="outline" className="bg-purple-50">Insurance</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Special Requests</h3>
                <p className="mt-1">{quote.details.specialRequests}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Internal Notes</h3>
                <p className="mt-1">{quote.notes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Price Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Price</span>
                      <span>{formatCurrency(quote.pricing.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Captain Fee</span>
                      <span>{formatCurrency(quote.pricing.captainFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cleaning Fee</span>
                      <span>{formatCurrency(quote.pricing.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service Fee</span>
                      <span>{formatCurrency(quote.pricing.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax</span>
                      <span>{formatCurrency(quote.pricing.taxAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(quote.pricing.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Deposit Required</span>
                      <span>{formatCurrency(quote.pricing.depositAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quote Actions</CardTitle>
              <CardDescription>Manage this quote's status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button className="w-full sm:w-auto">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Reminder Email
                </Button>
                
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button variant="outline">
                    <CopyCheck className="h-4 w-4 mr-2" />
                    Duplicate Quote
                  </Button>
                  
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Extend Expiration
                  </Button>
                </div>
                
                <Separator className="my-2" />
                
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Accepted
                  </Button>
                  
                  <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                    <X className="h-4 w-4 mr-2" />
                    Mark as Rejected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">{quote.customer.name}</h3>
                  <Link href={`/admin/users/${quote.customer.id}`} className="text-sm text-primary hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Email</h4>
                  <p className="text-sm">{quote.customer.email}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                  <p className="text-sm">{quote.customer.phone}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Boat Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Boat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                  <Ship className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium">{quote.boat.name}</h3>
                  <Link href={`/admin/boats/${quote.boat.id}`} className="text-sm text-primary hover:underline">
                    View Boat
                  </Link>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Category</h4>
                  <p className="text-sm">{formatBoatCategory(quote.boat.category)}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Owner</h4>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium">{quote.boat.owner.name}</p>
                    <p className="text-xs text-gray-500">{quote.boat.owner.email}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Link href={`/admin/users/${quote.boat.owner.id}`} className="text-xs text-primary hover:underline">
                    View Owner Profile
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timeline Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quote Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100">
                      <Edit className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="h-full w-px bg-gray-200"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Quote Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(quote.dates.createdAt).toLocaleDateString()} at {new Date(quote.dates.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="h-full w-px bg-gray-200"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Quote Sent</p>
                    <p className="text-sm text-gray-500">
                      {new Date(quote.dates.sentAt).toLocaleDateString()} at {new Date(quote.dates.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Expiration Date</p>
                    <p className="text-sm text-gray-500">
                      {new Date(quote.dates.expiresAt).toLocaleDateString()} at {new Date(quote.dates.expiresAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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

function formatBoatCategory(category: string) {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
} 