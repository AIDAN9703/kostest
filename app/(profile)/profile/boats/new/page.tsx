import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react";
import BoatForm from "@/components/boats/NewBoatForm";

// Loading skeleton component
const NewBoatSkeleton = () => (
  <div className="space-y-6 p-4 pt-16 md:p-6 lg:pt-6">
    <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
    <div className="h-[600px] bg-gray-200 animate-pulse rounded-lg"></div>
  </div>
);

// Main content component
const NewBoatContent = async () => {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  
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
        <BoatForm userId={session.user.id} />
      </div>
    </div>
  );
};

export default function NewBoatPage() {
  return (
    <Suspense fallback={<NewBoatSkeleton />}>
      <NewBoatContent />
    </Suspense>
  );
} 