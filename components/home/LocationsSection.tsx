'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";

// Move locations outside component to prevent recreation on each render
const locations = [
  {
    name: 'Miami',
    image: '/images/locations/miami.jpg',
    href: '/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=25.85578602396197&ne_lng=-80.13217904641093&sw_lat=25.7090419531335&sw_lng=-80.31860792381018&zoom_level=13&map_toggle=on',
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
  const prefersReducedMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update current index when carousel changes
  const onSelect = useCallback(() => {
    if (api) {
      setCurrentIndex(api.selectedScrollSnap());
    }
  }, [api]);

  // Set up API event listeners
  useEffect(() => {
    if (!api) return;
    
    onSelect();
    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Navigation handlers
  const prevSlide = useCallback(() => {
    if (api) api.scrollPrev();
  }, [api]);

  const nextSlide = useCallback(() => {
    if (api) api.scrollNext();
  }, [api]);

  // Optimize button animations for performance
  const buttonVariants = {
    hover: prefersReducedMotion ? {} : { scale: 1.05 },
    tap: prefersReducedMotion ? {} : { scale: 0.95 }
  };

  return (
    <section className="relative py-6 sm:py-10 font-poppins">
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
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white shadow-sm hover:shadow transition-all duration-300 border border-slate-200"
                  aria-label="Previous locations"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={nextSlide}
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
                <p className="text-slate-600 mt-2 text-sm font-light text-right pl-6">
                  Book a private charter in one of our main locations.
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
                  onClick={prevSlide}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow transition-all duration-300 border border-slate-200"
                  aria-label="Previous locations"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={nextSlide}
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
                  Book a private charter in one of our main locations.
                </p>
              </div>
            </div>
          </div>

          {/* Location cards */}
          <div className="mt-0">
            {/* Carousel replacing the scrollable container */}
            <Carousel 
              setApi={setApi}
              opts={{
                align: "start" as const,
                loop: true,
              }}
              className="w-full pb-8"
              aria-label="Available locations"
            >
              <CarouselContent>
                {locations.map((location, index) => (
                  <CarouselItem 
                    key={index} 
                    className="pl-4 basis-[200px] sm:basis-[240px] max-w-[200px] sm:max-w-[240px]"
                  >
                    <Link 
                      href={location.href}
                      className="block rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="relative aspect-square">
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
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
} 