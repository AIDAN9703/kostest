'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

interface Brand {
  name: string;
  logo: string;
  description: string;
  year: string;
}

const brands: Brand[] = [
  { 
    name: 'Miami Vice',
    logo: '/images/brands/miamivice.png',
    description: 'Luxury yacht partner since 2015',
    year: 'EST. 2015'
  },
  { 
    name: 'Rolex',
    logo: '/images/brands/rolex.png',
    description: 'Official timekeeper',
    year: 'EST. 1905'
  },
  { 
    name: 'Century',
    logo: '/images/brands/century.png',
    description: 'Premium vessel manufacturer',
    year: 'EST. 1926'
  },
  { 
    name: 'Beneteau',
    logo: '/images/brands/beneteau.png',
    description: 'Exclusive yacht provider',
    year: 'EST. 1884'
  },
  { 
    name: 'Sealine',
    logo: '/images/brands/sealine.png',
    description: 'Luxury marine partner',
    year: 'EST. 1972'
  },
  { 
    name: 'Freedom Boat Club',
    logo: '/images/brands/freedomboatclub.png',
    description: 'Premier boating network',
    year: 'EST. 1989'
  }
];

// Create a reversed version of the brands array without modifying the original
const reversedBrands = [...brands].reverse();

// Reusable animation variants for DRY code
const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ 
    duration: 0.5, 
    delay 
  })
};

export default function BrandsCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="relative py-8 sm:py-12 md:py-16 bg-white overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-[0.03]" />
      
      <motion.div
        style={{ opacity, y }}
        className="relative z-10"
      >
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 md:mb-16">
          <motion.div
            initial={fadeInUpAnimation.initial}
            whileInView={fadeInUpAnimation.animate}
            viewport={{ once: true }}
            transition={fadeInUpAnimation.transition()}
            className="text-center"
          >
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="h-[2px] w-16 sm:w-20 bg-gold" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1E293B] mb-3 sm:mb-4 md:mb-6">
             <span className="text-gold">Brands</span> Who Trust Us
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Partnering with the finest names in luxury yachting to deliver exceptional experiences
            </p>
          </motion.div>
        </div>

        {/* Brands Carousel - Full Width with no padding */}
        <div className="relative w-full overflow-hidden" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
          {/* Horizontal gradient overlays for sides */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-32 lg:w-40 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-32 lg:w-40 bg-gradient-to-l from-white to-transparent z-10" />

          {/* First Row */}
          <div className="flex space-x-4 sm:space-x-6 md:space-x-12 lg:space-x-16 animate-marquee py-3 sm:py-4 md:py-6 pl-4 sm:pl-8 md:pl-16">
            {[...brands, ...brands, ...brands].map((brand, index) => (
              <motion.div
                key={`${brand.name}-${index}`}
                whileHover={{ scale: 1.05 }}
                className="relative flex-shrink-0 group"
              >
                <div className="relative w-12 h-10 sm:w-16 sm:h-12 md:w-24 md:h-16 lg:w-32 lg:h-20 xl:w-40 xl:h-24 bg-white rounded-md sm:rounded-lg p-1 sm:p-2 flex items-center justify-center border border-gray-100 hover:border-gold/30 shadow-sm hover:shadow-md transition-all duration-300">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 
                             transition-all duration-300 p-2 sm:p-3"
                  />
                </div>
                
                {/* Tooltip - Hidden on mobile, visible on hover for larger screens */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="hidden sm:block absolute left-1/2 -translate-x-1/2 mt-2 sm:mt-4 bg-white/90 backdrop-blur-md 
                           px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-xl pointer-events-none text-center min-w-[120px] sm:min-w-[140px]
                           border border-gray-100 z-20"
                >
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {brand.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                    {brand.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Second Row */}
          <div className="flex space-x-4 sm:space-x-6 md:space-x-12 lg:space-x-16 animate-marquee-reverse mt-4 sm:mt-8 md:mt-12 py-3 sm:py-4 md:py-6 pl-4 sm:pl-8 md:pl-16">
            {[...reversedBrands, ...reversedBrands, ...reversedBrands].map((brand, index) => (
              <motion.div
                key={`${brand.name}-reverse-${index}`}
                whileHover={{ scale: 1.05 }}
                className="relative flex-shrink-0 group"
              >
                <div className="relative w-12 h-10 sm:w-16 sm:h-12 md:w-24 md:h-16 lg:w-32 lg:h-20 xl:w-40 xl:h-24 bg-white rounded-md sm:rounded-lg p-1 sm:p-2 flex items-center justify-center border border-gray-100 hover:border-gold/30 shadow-sm hover:shadow-md transition-all duration-300">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 
                             transition-all duration-300 p-2 sm:p-3"
                  />
                </div>
                
                {/* Tooltip - Hidden on mobile, visible on hover for larger screens */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="hidden sm:block absolute left-1/2 -translate-x-1/2 mt-2 sm:mt-4 bg-white/90 backdrop-blur-md 
                           px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-xl pointer-events-none text-center min-w-[120px] sm:min-w-[140px]
                           border border-gray-100 z-20"
                >
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {brand.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                    {brand.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
} 