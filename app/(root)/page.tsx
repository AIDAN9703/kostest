import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import {
  HeroSection,
  FeaturedFleet,
  ClientsShowcase,
  LocationsSection,
  BrandsCarousel,
  TestimonialsSection,
  RequestToBook,
} from "@/features/_marketing/landing/components";
import { getFeaturedBoats, getTestimonials } from "@/features/_marketing/landing/actions";

async function HomeContent() {
  try {
    const [boatsResponse, reviewsResponse] = await Promise.all([
      getFeaturedBoats(),
      getTestimonials(),
    ]);

    return (
      <>
        <HeroSection />

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          {boatsResponse.success && boatsResponse.data && boatsResponse.data.length > 0 && (
            <FeaturedFleet boats={boatsResponse.data} />
          )}

          <ClientsShowcase />
          <LocationsSection />
          <BrandsCarousel />

          {reviewsResponse.success && reviewsResponse.data && reviewsResponse.data.length > 0 && (
            <TestimonialsSection reviews={reviewsResponse.data} />
          )}
        </div>

        <RequestToBook />
      </>
    );
  } catch (error) {
    console.error("Error loading home page content:", error);
    return (
      <>
        <HeroSection />
        <div className="py-16 text-center">
          <p className="text-gray-500">Unable to load content. Please try again later.</p>
        </div>
      </>
    );
  }
}

export default function Home() {
  return (
    <main className="flex flex-col">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </main>
  );
}
