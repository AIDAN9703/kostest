import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBoatById } from "@/features-admin/boats/actions/boats";
import { BoatProfileHeader } from "@/features-admin/boats/components/BoatProfileHeader";
import { BoatDetails } from "@/features-admin/boats/components/BoatDetails";
import { boats } from "@/database/schema";

interface BoatDetailPageProps {
  params: Promise<{ id: string }>;
}


export default async function BoatDetailPage({ params }: BoatDetailPageProps) {
  const resolvedParams = await params;
  const boatId = resolvedParams.id;
  
  const boatData = await getBoatById(boatId).catch(() => null);
  
  if (!boatData) {
    notFound();
  }
  
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
          <h1 className="text-3xl font-bold tracking-tight">{boatData.name || "Unnamed Boat"}</h1>
          <p className="text-gray-500">View boat information</p>
        </div>
        <Link
          href={`/admin/boats/${boatId}/calendar`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Calendar Settings
        </Link>
        <Link
          href={`/admin/boats/${boatId}/edit`}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Edit Boat
        </Link>
      </div>

      {/* Boat Profile Header */}
      <BoatProfileHeader boat={boatData} />
      
      {/* Boat Details */}
      <BoatDetails boat={boatData} />
    </div>
  );
} 