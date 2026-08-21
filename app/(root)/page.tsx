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
import HeroSearchDock from "@/features/_marketing/landing/components/HeroSearchDock";
import { getFeaturedBoats, getTestimonials } from "@/features/_marketing/landing/actions";

async function HomeContent() {
  // Only the data fetch lives in try/catch — a try around JSX can't catch
  // child render errors anyway (that's what error boundaries are for).
  let boatsResponse: Awaited<ReturnType<typeof getFeaturedBoats>> | null = null;
  let reviewsResponse: Awaited<ReturnType<typeof getTestimonials>> | null = null;
  try {
    [boatsResponse, reviewsResponse] = await Promise.all([
      getFeaturedBoats(),
      getTestimonials(),
    ]);
  } catch (error) {
    console.error("Error loading home page content:", error);
  }

  if (!boatsResponse || !reviewsResponse) {
    return (
      <>
        <HeroSection />
        <div className="py-16 text-center">
          <p className="text-gray-500">Unable to load content. Please try again later.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroSection />
      <HeroSearchDock />

      {/* pt separates the first section from the hero's chip row. */}
      <div className="w-full max-w-[1200px] mx-auto px-4 pt-16 sm:px-8 sm:pt-14">
        {boatsResponse.success && boatsResponse.data && boatsResponse.data.length > 0 && (
          <FeaturedFleet boats={boatsResponse.data} />
        )}

        <ClientsShowcase />
        <LocationsSection />
        <BrandsCarousel />

        {reviewsResponse.success &&
          reviewsResponse.data &&
          reviewsResponse.data.reviews.length > 0 && (
            <TestimonialsSection reviews={reviewsResponse.data.reviews} />
          )}
      </div>

      <RequestToBook />
    </>
  );
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
