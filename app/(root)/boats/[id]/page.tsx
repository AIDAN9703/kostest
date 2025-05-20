import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import BoatDetails from "@/components/boats/listing/BoatDetails";
import BookingFormToggle from "@/components/boats/listing/BookingFormToggle";
import { MobileBookingBar } from "@/components/boats/listing/MobileBookingBar";
import { Boat } from "@/lib/types/types";
import { ImageGallery } from "@/components/boats/listing/sub-components/ImageGallery";

export default async function BoatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  try {
    // Fetch boat details
    const dbResult = await db
      .select()
      .from(boats)
      .where(eq(boats.id, id))
      .limit(1);

    if (!dbResult.length) {
      notFound();
    }

    // Convert DB result to application type
    const boat = dbResult[0] as Boat;

    return (
      <main className="min-h-screen bg-white sm:pt-6 pb-16 lg:pb-0">
        {/* Full-width image gallery on mobile, constrained on desktop */}
        <div className="sm:pl-4">
          <ImageGallery 
            mainImage={boat.mainImage}
            galleryImages={boat.galleryImages}
            alt={boat.name}
          />
        </div>

        {/* Content section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
            <div className="lg:col-span-8">
              <BoatDetails boat={boat} />
            </div>

            {/* Desktop booking form - hidden on mobile, shown on lg+ screens */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-20">
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <BookingFormToggle 
                    boat={boat}
                    user={session?.user}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile booking bar - shown on mobile, hidden on lg+ screens */}
        <div className="lg:hidden">
          <MobileBookingBar boat={boat} user={session?.user} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading boat:", error);
    notFound();
  }
} 