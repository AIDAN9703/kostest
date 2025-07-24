import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BoatForm } from "@/features-admin/boats/components/BoatForm";

export default function CreateBoatPage() {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Boat</h1>
          <p className="text-gray-500">Add a new boat to the platform</p>
        </div>
      </div>
      
      {/* Boat Creation Form */}
      <BoatForm />
    </div>
  );
} 