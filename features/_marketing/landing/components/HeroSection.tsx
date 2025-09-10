'use client'

import { useEffect } from 'react';
import Image from 'next/image';
import { useSearchStore } from '@/features/search/store/useSearchStore';
import SearchBar from '@/shared/components/layout/sub-components/SearchBar';
import { TypeAnimation } from 'react-type-animation';

// Pre-compute the sequence once outside component
const TYPE_SEQUENCE = [
  "Yacht", 4000,
  "Boat", 4000, 
  "Luxury", 4000,
  "Adventure", 4000,
  "Experience", 4000,
  "Escape", 3500,
] as (string | number)[];

export default function HeroSection() {
  const { setIsExpanded, resetSearchExpansion } = useSearchStore();
  
  // Reset search expansion on mount
  useEffect(() => {
    resetSearchExpansion();
  }, [resetSearchExpansion]);

  // Simple scroll handler - calculate actual search bar position
  useEffect(() => {
    const handleScroll = () => {
      // Hero section height
      const isDesktop = window.innerWidth >= 640;
      const heroHeight = window.innerHeight * (isDesktop ? 0.8 : 0.75);
      
      // Search bar is roughly 70% down the hero due to centering + spacing
      const searchBarPosition = heroHeight * 0.7;
      
      setIsExpanded(window.scrollY >= searchBarPosition);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsExpanded]);

  return (
    <section 
      className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden" 
      aria-label="Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/experiences/yacht-ppl-swim.jpg" 
          alt="Luxury yacht charter experience with guests enjoying crystal clear waters"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      </div>

      {/* Search Overlay Card */}
      <div className="absolute bottom-0 sm:bottom-50 left-0 right-0 z-20">
      
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* Main Heading */}
            <div className="mb-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-2">
                Find Your Perfect
                <br />
                <span className="inline-block relative">
                  <span className="relative">
                    <TypeAnimation
                      sequence={TYPE_SEQUENCE}
                      wrapper="span"
                      speed={25}
                      deletionSpeed={35}
                      repeat={Infinity}
                      cursor={false}
                      preRenderFirstString={true}
                      className="text-white relative z-10"
                    />
                    <div className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"></div>
                  </span>
                  <span className="text-white">{' Charter'}</span>
                </span>
              </h1>
              <p className="text-white text-base sm:text-lg font-poppins">
                500+ premium yachts • Professional crew • Unforgettable experiences
              </p>
            </div>
            
            {/* Search Bar */}
            <div>
              <SearchBar variant="hero" />
            </div>
            
          </div>
      </div>
    </section>
  );
}