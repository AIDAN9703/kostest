'use client'

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useSearchStore } from '@/store/useSearchStore';
import SearchBar from '@/components/navigation/sub-components/SearchBar';

// Move static data outside component
const WORD_OPTIONS = ["Yacht", "Boat", "Luxury", "Family", "Corporate", "Birthday"] as const;

export default function HeroSection2() {
  const [displayWord, setDisplayWord] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { setIsExpanded } = useSearchStore();
  
  // Use requestAnimationFrame with frame counter for controlled timing
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let direction = 1;
    let isPaused = false;
    let animationFrameId: number;
    let frameCount = 0;
    let timeoutId: NodeJS.Timeout;
    
    const animate = () => {
      if (isPaused || !isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      // Only update every 6 frames (approximately 100ms at 60fps)
      if (frameCount % 3 === 0) {
        const currentWord = WORD_OPTIONS[wordIndex];
        
        if (direction === 1) {
          if (charIndex < currentWord.length) {
            charIndex++;
            setDisplayWord(currentWord.slice(0, charIndex));
          } else {
            isPaused = true;
            timeoutId = setTimeout(() => {
              direction = -1;
              isPaused = false;
            }, 3000);
          }
        } else {
          if (charIndex > 0) {
            charIndex--;
            setDisplayWord(currentWord.slice(0, charIndex));
          } else {
            wordIndex = (wordIndex + 1) % WORD_OPTIONS.length;
            direction = 1;
            isPaused = true;
            timeoutId = setTimeout(() => {
              isPaused = false;
            }, 500);
          }
        }
      }
      
      frameCount++;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible]);

  // Intersection Observer for search bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger when the search bar is fully out of view
        setIsExpanded(!entry.isIntersecting);
      },
      { 
        threshold: 1,
        rootMargin: '0px'
      }
    );
    
    if (searchBarRef.current) {
      observer.observe(searchBarRef.current);
    }
    
    return () => observer.disconnect();
  }, [setIsExpanded]);

  // Visibility observer for the entire section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    const section = document.querySelector('section');
    if (section) {
      observer.observe(section);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      className="relative w-full h-[70vh] sm:h-[75] overflow-hidden" 
      aria-label="Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/herooption11.png" 
          alt="Luxury yachts in crystal clear waters"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          quality={75}
          onError={(e) => {
            console.error('Failed to load hero image');
            // You might want to set a fallback image here
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-50 transform-gpu"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center py-8 sm:py-12 md:py-16">
        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <h1 className="mb-2 text-center text-4xl sm:text-5xl md:text-[4rem] lg:text-7xl xl:text-8xl font-bold leading-[1.1] text-white">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-sky-300 to-emerald-400 bg-clip-text text-transparent">
              {displayWord} Experience
            </span>
          </h1>
          
          <p className="text-center text-sm sm:text-lg md:text-xl max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-white/90  sm:mt-2 mb-4">
            Discover unforgettable boat and yacht charters with experienced crew worldwide
          </p>
          
          {/* Search Bar */}
          <div
            ref={searchBarRef}
            className="w-full"
          >
            <SearchBar variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}