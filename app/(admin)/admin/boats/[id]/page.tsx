import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/database/db";
import { boats, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils/general-utils";
import { 
  ArrowLeft, 
  Ship, 
  Calendar, 
  Edit, 
  Trash2, 
  Anchor, 
  Users, 
  DollarSign, 
  MapPin, 
  Clock, 
  ShieldCheck,
  Gauge,
  LifeBuoy,
  FileText,
  Tag,
  Power
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConnectCalendarButton from "@/components/admin/calendar/ConnectCalendarButton";
import ActiveStatusToggle from "@/components/admin/boats/ActiveStatusToggle";

export const metadata: Metadata = {
  title: "Boat Details | Admin Dashboard",
  description: "View and manage detailed boat information",
};

export default async function BoatDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  // Resolve the params promise
  const resolvedParams = await params;
  
  // Fetch boat by ID
  const boatData = await db
    .select()
    .from(boats)
    .where(eq(boats.id, resolvedParams.id))
    .limit(1);
  
  if (!boatData.length) {
    notFound();
  }
  
  const boat = boatData[0];
  
  // Fetch owner details
  const ownerData = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      profileImage: users.profileImage
    })
    .from(users)
    .where(eq(users.id, boat.ownerId))
    .limit(1);
  
  const owner = ownerData.length > 0 ? ownerData[0] : null;

  // Function to format array to string
  const formatArrayToString = (arr?: string[] | null) => {
    if (!arr || arr.length === 0) return "N/A";
    return arr.join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/boats"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{boat.name}</h1>
          <p className="text-gray-500">Boat Details and Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/boats/${resolvedParams.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <ActiveStatusToggle 
                boatId={resolvedParams.id} 
                initialStatus={boat.active} 
              />
              {boat.featured && (
                <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/boats/${resolvedParams.id}`} target="_blank">
                  View Listing
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/boats/${resolvedParams.id}/calendar`}>
                  <Calendar className="mr-1 h-4 w-4" />
                  Calendar
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about the boat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Boat Image Gallery */}
              <div className="mb-6">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  {boat.mainImage ? (
                    <Image 
                      src={boat.mainImage} 
                      alt={boat.name} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Ship className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {boat.galleryImages && boat.galleryImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {boat.galleryImages.slice(0, 5).map((image, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                        <Image 
                          src={image} 
                          alt={`${boat.name} image ${i+1}`} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1">{boat.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Display Title</h3>
                  <p className="mt-1">{boat.displayTitle || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {boat.category}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Home Port</h3>
                  <p className="mt-1">{boat.homePort || "N/A"}</p>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                  {boat.description || "No description provided."}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/admin/boats/${resolvedParams.id}/edit?section=basic`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Basic Info
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Specifications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>Technical details and specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Make</p>
                    <p className="text-sm text-gray-500">{boat.make || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Model</p>
                    <p className="text-sm text-gray-500">{boat.model || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Year Built</p>
                    <p className="text-sm text-gray-500">{boat.yearBuilt || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Length</p>
                    <p className="text-sm text-gray-500">{boat.lengthFt ? `${boat.lengthFt} ft` : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Capacity</p>
                    <p className="text-sm text-gray-500">{boat.capacity ? `${boat.capacity} guests` : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Max Speed</p>
                    <p className="text-sm text-gray-500">{boat.maxSpeed ? `${boat.maxSpeed} knots` : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Power className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Engine Type</p>
                    <p className="text-sm text-gray-500">{boat.engineType || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Power className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Engine Power</p>
                    <p className="text-sm text-gray-500">{boat.enginePower || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Fuel Type</p>
                    <p className="text-sm text-gray-500">{boat.fuelType || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/admin/boats/${resolvedParams.id}/edit?section=specs`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Specifications
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Features & Amenities Card */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
              <CardDescription>Boat features, amenities, and safety equipment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Features</h3>
                <p className="mt-1 text-sm">{formatArrayToString(boat.features)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                <p className="mt-1 text-sm">{formatArrayToString(boat.amenities)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Safety Equipment</h3>
                <p className="mt-1 text-sm">{formatArrayToString(boat.safetyEquipment)}</p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/admin/boats/${resolvedParams.id}/edit?section=features`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Features
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Rules & Requirements Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rules & Requirements</CardTitle>
              <CardDescription>Rental rules and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rules</h3>
                <p className="mt-1 text-sm whitespace-pre-line">{boat.rules || "No rules specified."}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Special Instructions</h3>
                <p className="mt-1 text-sm whitespace-pre-line">{boat.specialInstructions || "No special instructions."}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cancellation Policy</h3>
                <p className="mt-1 text-sm">{boat.cancellationPolicy || "No cancellation policy specified."}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Crew Required</h3>
                  <p className="mt-1 text-sm">{boat.crewRequired ? "Yes" : "No"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Crew Included</h3>
                  <p className="mt-1 text-sm">{boat.crewIncluded ? "Yes" : "No"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Minimum Rental</h3>
                  <p className="mt-1 text-sm">{boat.minRentalHours ? `${boat.minRentalHours} hours` : (boat.minimumCharterDays ? `${boat.minimumCharterDays} days` : "N/A")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Instant Book</h3>
                  <p className="mt-1 text-sm">{boat.instantBook ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/admin/boats/${resolvedParams.id}/edit?section=rules`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Rules
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Boat pricing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Hourly Rate</span>
                <span className="font-medium">{formatCurrency(boat.hourlyRate)}</span>
              </div>
              {boat.halfDayPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Half Day</span>
                  <span className="font-medium">{formatCurrency(boat.halfDayPrice)}</span>
                </div>
              )}
              {boat.fullDayPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Full Day</span>
                  <span className="font-medium">{formatCurrency(boat.fullDayPrice)}</span>
                </div>
              )}
              {boat.weeklyRate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly Rate</span>
                  <span className="font-medium">{formatCurrency(boat.weeklyRate)}</span>
                </div>
              )}
              {boat.cleaningFee && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cleaning Fee</span>
                  <span className="font-medium">{formatCurrency(boat.cleaningFee)}</span>
                </div>
              )}
              {boat.depositAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security Deposit</span>
                  <span className="font-medium">{formatCurrency(boat.depositAmount)}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/admin/boats/${resolvedParams.id}/edit?section=pricing`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Pricing
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Owner Card */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
              <CardDescription>Details about the boat owner</CardDescription>
            </CardHeader>
            <CardContent>
              {owner ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      {owner.profileImage ? (
                        <Image 
                          src={owner.profileImage} 
                          alt={`${owner.firstName} ${owner.lastName}`} 
                          width={48} 
                          height={48} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{owner.firstName} {owner.lastName}</p>
                      <p className="text-sm text-gray-500">{owner.email}</p>
                    </div>
                  </div>
                  {owner.phoneNumber && (
                    <div className="pt-2">
                      <div className="text-sm font-medium text-gray-500">Phone</div>
                      <div>{owner.phoneNumber}</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Owner information not available</p>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/admin/users/${boat.ownerId}`}>
                  View Owner Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Calendar Card */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>Manage calendar connection</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center bg-blue-50 text-blue-700 h-12 w-12 rounded-full mx-auto">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">Not Connected</h3>
                  <p className="text-sm text-gray-500">
                    Connect this boat to Google Calendar to manage availability
                  </p>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-center">
              <ConnectCalendarButton 
                boatId={resolvedParams.id} 
                boatName={boat.name}
              />
            </CardFooter>
          </Card>

          {/* Documentation Card */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Registration and insurance details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Registration Number</h3>
                <p className="mt-1 text-sm">{boat.registrationNumber || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hull ID</h3>
                <p className="mt-1 text-sm">{boat.hullId || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Insurance Information</h3>
                <p className="mt-1 text-sm">{boat.insuranceInfo || "N/A"}</p>
              </div>
              {boat.insuranceExpiry && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Insurance Expiry</h3>
                  <p className="mt-1 text-sm">{new Date(boat.insuranceExpiry).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/admin/boats/${resolvedParams.id}/edit?section=documentation`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Documentation
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 