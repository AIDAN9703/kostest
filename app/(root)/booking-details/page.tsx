import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BookingDetailsContent from "@/components/boats/booking/BookingDetailsContent";

export default async function BookingDetailsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
        </div>
      }>
        <BookingDetailsContent user={session?.user} />
      </Suspense>
    </div>
  );
} 