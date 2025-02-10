'use client';

import React from 'react';
import HeroSection from "@/components/home/HeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BrandsCarousel from "@/components/home/BrandsCarousel";
import BackToTop from "@/components/home/BackToTop";

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      
      <div className="space-y-20 w-full">
      <TestimonialsSection />
        <BrandsCarousel />
      </div>

      <BackToTop />
    </main>
  );
}
