'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const clientImages = [
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
    size: 'large',
  },
  {
    url: '/clients/girls.jpg',
    title: 'Friends Celebration',
    size: 'large',
  },
  {
    url: '/clients/king.JPG',
    title: 'Ocean Royalty',
    size: 'medium',
  },
  {
    url: '/clients/hannah.JPG',
    title: 'Sunset Adventure',
    size: 'medium',
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % clientImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + clientImages.length) % clientImages.length);
  };

  return (
    <section className="relative py-2 sm:py-4 md:py-6 bg-white overflow-hidden">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Title Section */}
          <div className="lg:col-span-3 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary leading-tight">
                Discover your next on-the-water adventure
              </h2>
              <div className="flex items-center gap-2 mt-8">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 group border border-gray-200"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 group border border-gray-200"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Images Grid */}
          <div className="lg:col-span-9 relative">
            <div className="grid grid-cols-12 gap-4">
              {/* First Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="col-span-12 md:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden"
              >
                <Image
                  src={clientImages[currentIndex].url}
                  alt={clientImages[currentIndex].title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="col-span-12 md:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <Image
                  src={clientImages[(currentIndex + 1) % clientImages.length].url}
                  alt={clientImages[(currentIndex + 1) % clientImages.length].title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </motion.div>

              {/* Second Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="col-span-12 md:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <Image
                  src={clientImages[(currentIndex + 2) % clientImages.length].url}
                  alt={clientImages[(currentIndex + 2) % clientImages.length].title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="col-span-12 md:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden"
              >
                <Image
                  src={clientImages[(currentIndex + 3) % clientImages.length].url}
                  alt={clientImages[(currentIndex + 3) % clientImages.length].title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 