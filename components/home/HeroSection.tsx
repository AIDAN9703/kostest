'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchStore } from '@/store/useSearchStore';
import SearchBar from '@/components/navigation/sub-components/SearchBar';
import { TypeAnimation } from 'react-type-animation';

// Move static data outside component
const WORD_OPTIONS = ["Yacht", "Boat", "Luxury", "Family", "Corporate", "Birthday"] as const;

export default function HeroSection2() {
  const [isVisible, setIsVisible] = useState(true);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { setIsExpanded, resetSearchExpansion } = useSearchStore();
  
  // Reset expansion state when mounting the hero section
  useEffect(() => {
    resetSearchExpansion();
  }, [resetSearchExpansion]);

  // Split into two separate observers for better control
  useEffect(() => {
    // Section visibility observer for animation control - using fewer thresholds
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: [0.3], // Single threshold is sufficient for general visibility
        rootMargin: '0px'
      }
    );
    
    // Search bar visibility observer - more strategic thresholds
    const searchBarObserver = new IntersectionObserver(
      ([entry]) => {
        // Add a small delay to avoid flashing during quick scrolls
        const timer = setTimeout(() => {
          setIsExpanded(!entry.isIntersecting);
        }, 50);
        
        return () => clearTimeout(timer);
      },
      { 
        // Strategic threshold values to catch fast scrolling
        // 0 to detect when completely out of view
        // 0.5 to detect when half visible
        threshold: [0, 0.5], 
        rootMargin: '-10px 0px' // Small margin to improve detection
      }
    );
    
    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }
    
    if (searchBarRef.current) {
      searchBarObserver.observe(searchBarRef.current);
    }
    
    // Cleanup observers on unmount
    return () => {
      sectionObserver.disconnect();
      searchBarObserver.disconnect();
    };
  }, [setIsExpanded]);

  // Create sequence for TypeAnimation from word options
  const typeSequence = WORD_OPTIONS.reduce((sequence, word) => {
    return [...sequence, word, 3000, ''];
  }, [] as (string | number)[]);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden" 
      aria-label="Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/herooption22.jpg" 
          alt="Luxury yachts in crystal clear waters"
          fill
          className="object-cover"
          priority
          loading="eager"
          sizes="100vw"
          quality={80}
          onError={(e) => {
            console.error('Failed to load hero image');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-50 transform-gpu"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center py-8 sm:py-12 md:py-16 space-y-4">
        {/* Content area - text aligned center, using Poppins, and white text */}
        <div className="flex-1 flex flex-col items-center justify-center w-full font-poppins text-white text-center">
          <h1 className="leading-[1.1] text-4xl sm:text-5xl md:text-[4rem] lg:text-7xl xl:text-8xl font-semibold mb-2">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent min-h-[1.2em] inline-block">
              <TypeAnimation
                sequence={typeSequence}
                wrapper="span"
                speed={5}
                deletionSpeed={5}
                repeat={Infinity}
                cursor={false}
                className="inline-block"
                preRenderFirstString={true}
              />
              {' Experience'}
            </span>
          </h1>
          
          <p className="text-sm sm:text-lg md:text-xl max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-white/90 sm:mt-2 mb-4">
            Discover unforgettable boat and yacht charters with experienced crew worldwide
          </p>
          
          {/* Search Bar - with fixed sizing instead of percentage-based margins */}
          <div ref={searchBarRef} className="w-full mt-8 sm:mt-12 md:mt-16 lg:mt-20">
            <SearchBar variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}