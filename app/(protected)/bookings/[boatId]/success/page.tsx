import { Suspense } from "react";
import { auth } from "@/auth";
import BookingSuccessClient from "@/features/bookings/components/BookingSuccessClient";

export default async function BookingSuccessPage() {
  const session = await auth();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    }>
      <BookingSuccessClient user={session?.user || null} />
    </Suspense>
  );
}

