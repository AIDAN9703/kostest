import { getBoatById } from "@/lib/actions/boat-actions";

import { notFound } from "next/navigation";
import BoatDetails from "@/components/boats/listing/BoatDetails";
import { RequestBookingForm, InstantBookingForm } from "@/components/boats/listing/booking-form";
import { MobileBookingBar } from "@/components/boats/listing/booking-form/MobileBookingBar";
import { Boat } from "@/lib/types/types";
import { ImageGallery } from "@/components/boats/listing/sub-components/ImageGallery";

// ISR configuration for boat pages
// Revalidate every 6 hours since boat details don't change frequently
export const revalidate = 21600; // 6 hours in seconds

// Using on-demand ISR generation - no pre-building at build time
// Pages will be generated and cached when first visited

export default async function BoatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Fetch boat details
    const boat = await getBoatById(id);

    if (!boat) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-white sm:pt-6 pb-16 lg:pb-0">
        {/* Full-width image gallery on mobile, constrained on desktop */}
        <div className="sm:pl-4">
          <ImageGallery 
            mainImage={boat.mainImage || ''}
            galleryImages={boat.galleryImages || []}
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
            <aside className="lg:col-span-4 hidden md:block">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  {boat.instantBook ? (
                    <InstantBookingForm boat={boat} />
                  ) : (
                    <RequestBookingForm boat={boat} />
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile booking bar - shown on mobile, hidden on lg+ screens */}
        <div className="md:hidden">
          <MobileBookingBar boat={boat} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading boat:", error);
    notFound();
  }
} 