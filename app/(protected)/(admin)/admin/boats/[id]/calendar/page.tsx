import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import BoatCalendar from "@/features-admin/boats/components/BoatCalendar";

export const metadata: Metadata = {
  title: "Boat Calendar | Admin Dashboard",
  description: "View boat bookings in calendar format",
};

export default async function BoatCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  // Fetch boat by ID
  const boatData = await db
    .select({
      id: boats.id,
      name: boats.name,
    })
    .from(boats)
    .where(eq(boats.id, resolvedParams.id))
    .limit(1);

  if (!boatData.length) {
    notFound();
  }

  const boat = boatData[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/boats/${boat.id}`}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{boat.name}</h1>
          <p className="text-gray-500">Booking Calendar</p>
        </div>
      </div>

      {/* FullCalendar Component */}
      <BoatCalendar 
        boatId={boat.id} 
        boatName={boat.name}
      />
    </div>
  );
} 