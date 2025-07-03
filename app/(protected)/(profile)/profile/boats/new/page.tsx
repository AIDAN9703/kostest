import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import BoatForm from "@/components/boats/NewBoatForm";

export default async function NewBoatPage() {
  // Auth is handled by layout, just get session for user data
  const session = await auth();
  
  // Session is guaranteed to exist due to protected layout
  const userId = session?.user?.id;
  if (!userId) return null;
  
  return (
    <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile/boats">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">List a New Boat</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BoatForm userId={userId} />
      </div>
    </div>
  );
} 