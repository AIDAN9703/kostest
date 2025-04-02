import React from 'react';
import { HeroSection, TestimonialsSection, BrandsCarousel, BackToTop, FeaturedFleet, WhyChooseUs, PopularExperiences, RequestToBook, ComparisonChart } from "@/components/home";
import { getFeaturedBoats, getTestimonials } from "@/lib/actions/home-page";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ClientsShowcase from '@/components/home/ClientsShowcase';
// This component wraps all the content that needs data
async function HomeContent() {
  try {
    // Fetch all data in parallel
    const [boatsResponse, reviewsResponse] = await Promise.all([
      getFeaturedBoats(),
      getTestimonials()
    ]);
    
    return (
      <>
        <HeroSection />
        <div className="w-full">
          {boatsResponse.success && boatsResponse.data && boatsResponse.data.length > 0 && (
            <FeaturedFleet boats={boatsResponse.data} />
          )}
          <WhyChooseUs />
          <ClientsShowcase />
          {/*<ComparisonChart />*/}
          <PopularExperiences />
          {reviewsResponse.success && reviewsResponse.data && reviewsResponse.data.length > 0 && (
            <TestimonialsSection reviews={reviewsResponse.data} />
          )}
          <BrandsCarousel />
          <RequestToBook />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading home page content:', error);
    // Return a minimal version of the page if data fetching fails
    return (
      <>
        <HeroSection />
        <div className="space-y-20 w-full">
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load content. Please try again later.</p>
          </div>
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
      <BackToTop />
    </main>
  );
}
