import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { count } from "drizzle-orm";
import { 
  ArrowUpDown, 
  Calendar, 
  Download, 
  Edit, 
  FilePlus, 
  MapPin, 
  MoreHorizontal, 
  Search, 
  Settings, 
  Ship, 
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/general-utils";

export const metadata: Metadata = {
  title: "Manage Boats | Admin Dashboard",
  description: "Manage all boat listings in the KOS Yachts platform",
};

export default async function AdminBoatsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }> | undefined;
}) {
  // Await the searchParams promise
  const resolvedParams = await searchParams || {};
  
  const query = resolvedParams.query || "";
  const currentPage = Number(resolvedParams.page) || 1;
  const pageSize = 10;

  // Fetch boats from database with pagination
  const allBoats = await db.select().from(boats).limit(pageSize).offset((currentPage - 1) * pageSize);
  
  // Count total for pagination
  const countResult = await db.select({ value: count() }).from(boats);
  const totalCount = countResult[0]?.value || 0;
  
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boats</h1>
          <p className="text-gray-500">Manage all boat listings in the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/boats/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90"
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Add New Boat
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search boats..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Filter</span>
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boats List */}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium">Boat</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 font-medium text-center">Calendar</th>
              <th className="px-4 py-3 font-medium text-center">Active</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allBoats.map(boat => (
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
                    <div>
                      <div className="font-medium">{boat.name}</div>
                      <div className="text-xs text-gray-500">ID: {boat.id.toString().split('-')[0]}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {boat.ownerId.toString().split('-')[0]}...
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                    {boat.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    <span>{boat.homePort || "N/A"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(boat.hourlyRate)}
                  <span className="text-xs text-gray-500">/hour</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/admin/boats/${boat.id}/calendar`}>
                    <span className="inline-block p-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
                      <Calendar className="h-4 w-4" />
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${boat.active ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/boats/${boat.id}`}
                      className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <button
                      className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {allBoats.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No boats found. <Link href="/admin/boats/new" className="text-primary hover:underline">Add a new boat</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> boats
          </div>
          <div className="flex gap-1">
            <Link
              href={`/admin/boats?page=${Math.max(1, currentPage - 1)}${query ? `&query=${query}` : ''}`}
              className={`px-3 py-2 rounded-md border ${currentPage === 1 ? 'text-gray-300 border-gray-200 pointer-events-none' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/boats?page=${Math.min(totalPages, currentPage + 1)}${query ? `&query=${query}` : ''}`}
              className={`px-3 py-2 rounded-md border ${currentPage === totalPages ? 'text-gray-300 border-gray-200 pointer-events-none' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 