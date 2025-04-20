'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

// Move locations outside component to prevent recreation on each render
const locations = [
  {
    name: 'Miami',
    image: '/images/locations/miami.jpg',
    href: '/locations/miami',
  },
  {
    name: 'Fort Lauderdale',
    image: '/images/locations/fort-lauderdale.png',
    href: '/locations/fort-lauderdale',
  },
  {
    name: 'Naples',
    image: '/images/locations/naples.jpg',
    href: '/locations/naples',
  },
  {
    name: 'West Palm Beach',
    image: '/images/locations/west-palm.jpg',
    href: '/locations/west-palm-beach',
  },
  {
    name: 'Connecticut',
    image: '/images/locations/conneticut.jpg',
    href: '/locations/connecticut',
  },
  {
    name: 'Bahamas',
    image: '/images/locations/bahamas.jpg',
    href: '/locations/bahamas',
  },
  {
    name: 'Dominican Republic',
    image: '/images/locations/dominican-republic.jpg',
    href: '/locations/dominican-republic',
  }
];

export default function LocationsSection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Memoize scroll handlers to prevent recreation on each render
  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }, [prefersReducedMotion]);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }, [prefersReducedMotion]);

  // Optimize button animations for performance
  const buttonVariants = {
    hover: prefersReducedMotion ? {} : { scale: 1.05 },
    tap: prefersReducedMotion ? {} : { scale: 0.95 }
  };

  return (
    <section className="relative py-6 sm:py-10 bg-white font-poppins">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-6">
        <div className="flex flex-col">
          {/* Mobile & Desktop Header */}
          <div className="mb-5">
            {/* Mobile header: Buttons on left, text on right */}
            <div className="flex items-center justify-between sm:hidden">
              {/* Navigation arrows on left for mobile */}
              <div className="flex items-center gap-2">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={scrollLeft}
                  className="p-2 rounded-full bg-white shadow-sm hover:shadow transition-all duration-300 border border-slate-200"
                  aria-label="Previous locations"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={scrollRight}
                  className="p-2 rounded-full bg-white shadow-sm hover:shadow transition-all duration-300 border border-slate-200"
                  aria-label="Next locations"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </motion.button>
              </div>
              
              {/* Title content - right aligned on mobile */}
              <div className="max-w-xs">
                <h2 className="text-3xl font-medium text-primary leading-tight text-right">
                  Explore our destinations
                </h2>
                <p className="text-slate-600 mt-2 text-sm font-light text-right">
                  Book a private boat rental in one of our main locations.
                </p>
              </div>
            </div>

            {/* Desktop header: title and buttons in separate rows */}
            <div className="hidden sm:flex flex-row items-start justify-between">
              {/* Navigation arrows - on the left for desktop */}
              <div className="self-end flex items-center gap-3 mt-7">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={scrollLeft}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow transition-all duration-300 border border-slate-200"
                  aria-label="Previous locations"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={scrollRight}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow transition-all duration-300 border border-slate-200"
                  aria-label="Next locations"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </motion.button>
              </div>
              
              {/* Title content - right aligned */}
              <div className="max-w-xl text-right ml-auto">
                <h2 className="text-4xl md:text-5xl font-medium text-primary leading-tight">
                  Explore destinations
                </h2>
                <p className="text-slate-600 mt-2 text-lg font-light">
                  Book a private boat rental in one of our main locations.
                </p>
              </div>
            </div>
          </div>

          {/* Location cards */}
          <div className="mt-0">
            {/* Scrollable locations container - use transform instead of layout changes for better performance */}
            <div 
              ref={scrollRef} 
              className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory will-change-transform"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none'
              }}
            >
              {locations.map((location, index) => (
                <Link 
                  href={location.href} 
                  key={index}
                  className="flex-none w-[200px] sm:w-[240px] rounded-lg overflow-hidden snap-start group hover:shadow-md transition-shadow duration-300"
                  style={{ 
                    aspectRatio: '1/1',
                    contain: 'layout paint'
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={location.image}
                      alt={location.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 200px, 240px"
                      priority={index < 3}
                      loading={index >= 3 ? "lazy" : undefined}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <h3 className="text-xl font-normal text-white">{location.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 