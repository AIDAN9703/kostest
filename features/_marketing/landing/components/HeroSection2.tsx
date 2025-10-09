'use client'

import { useEffect } from 'react';
import Image from 'next/image';
import { useSearchStore } from '@/features/search/store/useSearchStore';
import SearchBar from '@/shared/layouts/sub-components/SearchBar';
import { TypeAnimation } from 'react-type-animation';

const TYPE_SEQUENCE = [
  "Yacht", 5000,
  "Boat", 5000, 
  "Luxury", 5000,
  "Family", 5000,
  "Corporate", 5000,
  "Birthday", 3000,
] as (string | number)[];

export default function HeroSection2() {
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
      className="relative w-full h-[80vh] overflow-hidden" 
      aria-label="Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/herooption22-edited.jpg" 
          alt="Luxury yachts in crystal clear waters"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
        />
        {/* Improved gradient overlay - better boat visibility */}
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-linear-to-b from-black/40 to-transparent" />
      </div>

      {/* Simple Two Column Layout */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-stretch justify-between min-h-[80vh] gap-12">
            {/* Left Side */}
            <div className="flex-1 text-white flex flex-col justify-center">
              <h1 className="font-medium leading-[1.1] mb-8">
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                  Discover
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                  Your
                  <span className="bg-linear-to-r from-cyan-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent ml-2">
                    Perfect
                  </span>
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                  <TypeAnimation
                    sequence={TYPE_SEQUENCE}
                    wrapper="span"
                    speed={20}
                    deletionSpeed={30}
                    repeat={Infinity}
                    cursor={false}
                    preRenderFirstString={true}
                  />
                  <span> Charter</span>
                </span>
              </h1>
              <div className="max-w-md">
                <p className="text-lg font-light text-white leading-relaxed">
                  Our curated collection of luxury yachts and boats with professional crew, 
                  is expertly tailored for discerning guests seeking extraordinary experiences.
                </p>
              </div>
            </div>
            {/* Right Side */}
            <div className="w-full lg:w-1/3 flex flex-col justify-end self-end lg:mb-36">
              <h3 className="text-white text-xl font-light mb-2 ml-4">
                Let's Begin Your Journey!
              </h3>
              <SearchBar variant="hero" />
              <p className="text-xs font-light text-white tracking-wide uppercase mt-6 text-center">
                Available worldwide • Premium vessels • Expert crew
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 