'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Keep client images outside component to prevent recreation
const clientImages = [
  {
    url: '/clients/beachday.jpeg',
    title: 'Beach Day',
  },
  {
    url: '/clients/bernie.JPG',
    title: 'Deep Sea Adventure',
  },
  {
    url: '/clients/niceyacht.jpg',
    title: 'Luxury Yacht Experience',
  },
  {
    url: '/clients/girls.jpg',
    title: 'Friends Celebration',
  },
  {
    url: '/clients/backflip.JPG',
    title: 'Backflip',
  },
  {
    url: '/clients/bunchofgirls.JPG',
    title: 'Bunch of Girls',
  },
  {
    url: '/clients/jetski.jpeg',
    title: 'Jetski',
  },
  {
    url: '/clients/king.JPG',
    title: 'Ocean Royalty',
  },
  {
    url: '/clients/hannah.JPG',
    title: 'Sunset Adventure',
  },
  {
    url: '/clients/koshat.jpeg',
    title: 'Paradise Found',
  },
  {
    url: '/clients/fishing.jpeg',
    title: 'Fishing',
  },
];

export default function ClientsShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Memoize handlers to prevent recreation on each render
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 4) % clientImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 4 + clientImages.length) % clientImages.length);
  }, []);

  // Memoize current images to prevent recreation on each render
  const currentImages = useMemo(() => [
    clientImages[currentIndex],
    clientImages[(currentIndex + 1) % clientImages.length],
    clientImages[(currentIndex + 2) % clientImages.length],
    clientImages[(currentIndex + 3) % clientImages.length],
  ], [currentIndex]);

  // Memoize button animations for performance
  const buttonVariants = useMemo(() => ({
    hover: prefersReducedMotion ? {} : { scale: 1.05 },
    tap: prefersReducedMotion ? {} : { scale: 0.95 }
  }), [prefersReducedMotion]);

  // Optimize animations based on user preference
  const fadeTransition = useMemo(() => ({ 
    duration: prefersReducedMotion ? 0.2 : 0.5 
  }), [prefersReducedMotion]);

  const slideInTransition = useMemo(() => ({ 
    duration: prefersReducedMotion ? 0.2 : 0.6 
  }), [prefersReducedMotion]);

  // Image grid with optimized animations
  const ImageGrid = useCallback(() => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
        transition={fadeTransition}
        className="grid grid-cols-12 gap-3 will-change-transform"
      >
        {/* Top Row */}
        <motion.div 
          layout={!prefersReducedMotion}
          className="col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden"
          style={{ contain: 'layout paint' }}
        >
          <Image
            src={currentImages[0].url}
            alt={currentImages[0].title}
            fill
            className="object-cover"
            sizes="58vw"
            priority
            quality={prefersReducedMotion ? 75 : 85}
          />
        </motion.div>
        <motion.div 
          layout={!prefersReducedMotion}
          className="col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden mt-[13%]"
          style={{ contain: 'layout paint' }}
        >
          <Image
            src={currentImages[1].url}
            alt={currentImages[1].title}
            fill
            className="object-cover"
            sizes="42vw"
            quality={prefersReducedMotion ? 75 : 85}
          />
        </motion.div>

        {/* Bottom Row */}
        <motion.div 
          layout={!prefersReducedMotion}
          className="col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden"
          style={{ contain: 'layout paint' }}
        >
          <Image
            src={currentImages[2].url}
            alt={currentImages[2].title}
            fill
            className="object-cover"
            sizes="42vw"
            quality={prefersReducedMotion ? 75 : 85}
          />
        </motion.div>
        <motion.div 
          layout={!prefersReducedMotion}
          className="col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden"
          style={{ contain: 'layout paint' }}
        >
          <Image
            src={currentImages[3].url}
            alt={currentImages[3].title}
            sizes="58vw"
            fill
            className="object-cover"
            quality={prefersReducedMotion ? 75 : 85}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ), [currentIndex, fadeTransition, prefersReducedMotion, currentImages]);

  return (
    <section className="py-6 sm:py-10 relative bg-white overflow-hidden">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-4">
        {/* Mobile Layout (default) */}
        <div className="flex flex-col gap-6 md:hidden">
          <div className="flex items-center justify-between">
            <motion.h2
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={slideInTransition}
              className="font-poppins font-medium text-3xl sm:text-4xl md:text-5xl text-primary leading-tight max-w-md will-change-transform"
            >
              Discover your next on-the-water adventure
            </motion.h2>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={prevSlide}
                className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={nextSlide}
                className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </motion.button>
            </div>
          </div>
          <div className="w-full">
            <ImageGrid />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="col-span-3 z-10">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={slideInTransition}
              className="will-change-transform"
            >
              <h2 className="font-poppins font-medium text-3xl sm:text-4xl md:text-5xl text-primary leading-tight">
                Discover your next on-the-water adventure
              </h2>
              <div className="flex items-center gap-2 mt-8">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </motion.button>
              </div>
            </motion.div>
          </div>
          <div className="col-span-9 relative">
            <ImageGrid />
          </div>
        </div>
      </div>
    </section>
  );
} 