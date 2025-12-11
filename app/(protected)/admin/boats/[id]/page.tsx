import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Edit } from "lucide-react";
import { getBoatById } from "@/features/boats/actions/boat-actions";
import { BoatProfileHeader } from "@/features/boats/components/BoatProfileHeader";
import { BoatDetails } from "@/features/boats/components/BoatDetails";
import { Button } from "@/shared/components/ui/button";

interface BoatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoatDetailPage({ params }: BoatDetailPageProps) {
  const resolvedParams = await params;
  const boatId = resolvedParams.id;
  
  const boatData = await getBoatById(boatId);
  
  if (!boatData) {
    notFound();
  }
  
  return (
    <div className="h-full flex flex-col overflow-hidden bg-white rounded-3xl shadow-xs border border-gray-200/70">
      {/* Page Header */}
      <div className="flex-shrink-0 border-b border-gray-200/70 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/boats"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to boats"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {boatData.name || "Unnamed Boat"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {boatData.category?.replace(/_/g, ' ')} • {boatData.lengthFt}ft
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/boats/${boatId}/calendar`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
            </Link>
            <Link href={`/admin/boats/${boatId}/edit`}>
              <Button size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Boat
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <BoatProfileHeader boat={boatData} />
        <BoatDetails boat={boatData} />
      </div>
    </div>
  );
}
