import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminAddUpdateBoatForm from "@/features/boats/components/forms/admin-add-update-boat-form";

export default function CreateBoatPage() {
  return (
    <div className="space-y-6">
     
      {/* Boat Creation Form */}
      <AdminAddUpdateBoatForm />
    </div>
  );
} 