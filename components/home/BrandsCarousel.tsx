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

export default function BrandsCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-16 sm:py-24 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-[0.03]" />
      
      <motion.div
        style={{ opacity }}
        className="relative"
      >
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-primary/90 text-sm font-semibold tracking-wider uppercase">
              Our Partners
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Trusted By World-Class Brands
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Partnering with the finest names in luxury yachting to deliver exceptional experiences
            </p>
          </motion.div>
        </div>

        {/* Brands Carousel - Full Width */}
        <div className="relative w-full overflow-hidden">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-white to-transparent z-10" />

          {/* First Row */}
          <div className="flex space-x-8 sm:space-x-16 lg:space-x-24 animate-marquee">
            {[...brands, ...brands].map((brand, index) => (
              <motion.div
                key={`${brand.name}-${index}`}
                whileHover={{ scale: 1.05 }}
                className="relative flex-shrink-0 group"
              >
                <div className="relative w-20 h-14 sm:w-28 sm:h-20 lg:w-40 lg:h-24">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 
                             transition-all duration-300"
                  />
                </div>
                
                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 mt-4 bg-white/80 backdrop-blur-md 
                           px-4 py-2 rounded-lg shadow-xl pointer-events-none text-center min-w-[140px]
                           border border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {brand.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {brand.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Second Row */}
          <div className="flex space-x-8 sm:space-x-16 lg:space-x-24 animate-marquee-reverse mt-8 sm:mt-16">
            {[...reversedBrands, ...reversedBrands].map((brand, index) => (
              <motion.div
                key={`${brand.name}-reverse-${index}`}
                whileHover={{ scale: 1.05 }}
                className="relative flex-shrink-0 group"
              >
                <div className="relative w-20 h-14 sm:w-28 sm:h-20 lg:w-40 lg:h-24">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 
                             transition-all duration-300"
                  />
                </div>
                
                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 mt-4 bg-white/80 backdrop-blur-md 
                           px-4 py-2 rounded-lg shadow-xl pointer-events-none text-center min-w-[140px]
                           border border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {brand.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
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