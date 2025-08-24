import { Suspense } from "react";
import { auth } from "@/auth";
import BookingSuccessContent from "@/features/bookings/components/BookingSuccessContent";

export default async function BookingSuccessPage() {
  const session = await auth();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    }>
      <BookingSuccessContent user={session?.user || null} />
    </Suspense>
  );
}
