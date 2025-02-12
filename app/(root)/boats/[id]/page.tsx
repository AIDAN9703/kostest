import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import BoatDetails from "@/components/boats/BoatDetails";
import BookingRequestForm from "@/components/boats/BookingRequestForm";

export default async function BoatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  try {
    // Fetch boat details
    const boat = await db
      .select()
      .from(boats)
      .where(eq(boats.id, id))
      .limit(1)
      .then(res => res[0]);

    if (!boat) {
      notFound();
    }

    return (
      <main className="flex min-h-screen flex-col bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Boat Details Section */}
            <div className="lg:col-span-2">
              <BoatDetails boat={boat} />
            </div>

            {/* Booking Form Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingRequestForm 
                  boat={boat}
                  user={session?.user}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching boat:", error);
    notFound();
  }
} 