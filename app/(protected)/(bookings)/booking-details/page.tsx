import { Suspense } from "react";
import { auth } from "@/auth";
import BookingDetailsContent from "@/features/bookings/components/BookingDetailsContent";

export default async function BookingDetailsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
        </div>
      }>
        <BookingDetailsContent user={session?.user ?? null} />
      </Suspense>
    </div>
  );
} 