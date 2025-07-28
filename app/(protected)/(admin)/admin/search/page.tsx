import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, Ship, Calendar, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { db } from '@/database/db';
import { users, boats, bookings, boatPricingTiers } from '@/database/schema';
import { like, or, ilike, desc, eq, and, inArray } from 'drizzle-orm';
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/shared/utils/general-utils";
import { getBoatDefaultPrice, getBoatDefaultHours } from "@/shared/utils/pricing-utils";

export const metadata: Metadata = {
  title: "Search Results | Admin Dashboard",
  description: "Search results across users, boats, and bookings",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams.q as string) || "";
  const type = (resolvedParams.type as string) || "all";
  
  if (!query || query.length < 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Enter a search term</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter at least 2 characters to search across users, boats, and bookings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Search for users
  const userResults = type === 'all' || type === 'users' ? await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      username: users.username,
      profileImage: users.profileImage,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      or(
        ilike(users.firstName, `%${query}%`),
        ilike(users.lastName, `%${query}%`),
        ilike(users.email, `%${query}%`),
        ilike(users.username, `%${query}%`)
      )
    )
    .limit(20) : [];

  // Search for boats
  const boatResults = type === 'all' || type === 'boats' ? await db
    .select({
      id: boats.id,
      name: boats.name,
      category: boats.category,
      mainImage: boats.mainImage,
      locationLabel: boats.locationLabel,
      active: boats.active,
      make: boats.make,
      model: boats.model,
      yearBuilt: boats.yearBuilt,
      ownerId: boats.ownerId,
      lengthFt: boats.lengthFt,
      capacity: boats.capacity,
      features: boats.features,
      crewRequired: boats.crewRequired,
      crewIncluded: boats.crewIncluded,
      dayCharter: boats.dayCharter,
      termCharter: boats.termCharter,
      fuelIncluded: boats.fuelIncluded,
      instantBook: boats.instantBook,
      createdAt: boats.createdAt,
      updatedAt: boats.updatedAt,
    })
    .from(boats)
    .where(
      or(
        ilike(boats.name, `%${query}%`),
        ilike(boats.make, `%${query}%`),
        ilike(boats.model, `%${query}%`),
        ilike(boats.locationLabel, `%${query}%`)
      )
    )
    .limit(20) : [];

  // Get pricing tiers for all fetched boats
  let boatsWithPricingTiers = [];
  if (boatResults.length > 0) {
    // Get all boat IDs for the query
    const boatIds = boatResults.map(boat => boat.id);
    
    // Get pricing tiers for all boats in a single query
    const pricingTiersResults = await db
      .select()
      .from(boatPricingTiers)
      .where(and(
        eq(boatPricingTiers.isActive, true),
        inArray(boatPricingTiers.boatId, boatIds)
      ));

    // Group tiers by boat ID
    const tiersByBoatId = pricingTiersResults.reduce((acc, tier) => {
      if (!acc[tier.boatId]) acc[tier.boatId] = [];
      acc[tier.boatId].push(tier);
      return acc;
    }, {} as Record<string, typeof boatPricingTiers.$inferSelect[]>);
    
    // Combine boat data with their pricing tiers
    boatsWithPricingTiers = boatResults.map(boat => ({
      ...boat,
      ownerId: boat.ownerId || "",
      lengthFt: boat.lengthFt || 0,
      capacity: boat.capacity || 0,
      features: boat.features || [],
      crewRequired: boat.crewRequired ?? true,
      crewIncluded: boat.crewIncluded ?? true,
      dayCharter: boat.dayCharter ?? true,
      termCharter: boat.termCharter ?? false,
      fuelIncluded: boat.fuelIncluded ?? false,
      instantBook: boat.instantBook ?? false,
      active: boat.active ?? false,
      createdAt: boat.createdAt || new Date(),
      updatedAt: boat.updatedAt || new Date(),
      pricingTiers: tiersByBoatId[boat.id] || []
    }));
  } else {
    boatsWithPricingTiers = boatResults;
  }

  // Search for bookings
  const bookingResults = type === 'all' || type === 'bookings' ? await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      status: bookings.bookingStatus,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      totalAmount: bookings.totalAmount,
    })
    .from(bookings)
    .where(
      or(
        ilike(bookings.customerName, `%${query}%`),
        ilike(bookings.customerEmail, `%${query}%`)
      )
    )
    .orderBy(desc(bookings.startDateTime))
    .limit(20) : [];

  // Helper to format dates
  const formatDate = (date: Date | null) => {
    if (!date) return "No date";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const totalResults = userResults.length + boatResults.length + bookingResults.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
            <p className="text-gray-500">Found {totalResults} results for "{query}"</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/search?q=${encodeURIComponent(query)}&type=all`}>
            <Button variant={type === 'all' || !type ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
          <Link href={`/admin/search?q=${encodeURIComponent(query)}&type=users`}>
            <Button variant={type === 'users' ? "default" : "outline"} size="sm">
              Users
            </Button>
          </Link>
          <Link href={`/admin/search?q=${encodeURIComponent(query)}&type=boats`}>
            <Button variant={type === 'boats' ? "default" : "outline"} size="sm">
              Boats
            </Button>
          </Link>
          <Link href={`/admin/search?q=${encodeURIComponent(query)}&type=bookings`}>
            <Button variant={type === 'bookings' ? "default" : "outline"} size="sm">
              Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Users Results */}
      {(type === 'all' || type === 'users') && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="mr-2 h-5 w-5 text-gray-500" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {userResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userResults.map(user => (
                      <tr key={user.id.toString()} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                              {user.profileImage ? (
                                <Image
                                  src={user.profileImage}
                                  alt={user.username || ""}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-primary text-white text-xs font-medium">
                                  {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName || ""}</div>
                              <div className="text-xs text-gray-500">{user.username ? `@${user.username}` : ""}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                              user.status === "ACTIVE"
                                ? "bg-green-50 text-green-700"
                                : user.status === "INACTIVE"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">No users found matching "{query}"</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Boats Results */}
      {(type === 'all' || type === 'boats') && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 pb-3">
            <CardTitle className="flex items-center text-lg">
              <Ship className="mr-2 h-5 w-5 text-gray-500" />
              Boats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {boatResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium">Boat</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Rate</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boatsWithPricingTiers.map(boat => (
                      <tr key={boat.id.toString()} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                              {boat.mainImage ? (
                                <Image
                                  src={boat.mainImage}
                                  alt={boat.name}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Ship className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="font-medium">{boat.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            {boat.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {boat.make} {boat.model} {boat.yearBuilt && `(${boat.yearBuilt})`}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{boat.locationLabel || "N/A"}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(getBoatDefaultPrice(boat))}/{getBoatDefaultHours(boat)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${boat.active ? "bg-green-500" : "bg-gray-300"}`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/boats/${boat.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">No boats found matching "{query}"</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bookings Results */}
      {(type === 'all' || type === 'bookings') && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-gray-500" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bookingResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium">Booking ID</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingResults.map(booking => (
                      <tr key={booking.id.toString()} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {booking.id.toString().split('-')[0]}...
                        </td>
                        <td className="px-4 py-3 font-medium">{booking.customerName}</td>
                        <td className="px-4 py-3 text-gray-600">{booking.customerEmail}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {booking.startDateTime ? new Date(booking.startDateTime).toLocaleDateString() : "N/A"}
                          {booking.endDateTime ? ` - ${new Date(booking.endDateTime).toLocaleDateString()}` : ""}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                            booking.status === "CONFIRMED"
                              ? "bg-green-50 text-green-700"
                              : booking.status === "PENDING"
                              ? "bg-yellow-50 text-yellow-700"
                              : booking.status === "CANCELLED"
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-700"
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">${booking.totalAmount}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">No bookings found matching "{query}"</div>
            )}
          </CardContent>
        </Card>
      )}

      {totalResults === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any results matching "{query}". Try using different keywords or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 