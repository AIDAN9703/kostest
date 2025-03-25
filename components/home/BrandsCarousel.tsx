'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

interface Brand {
  name: string;
  logo: string;
}

const brands: Brand[] = [
  { name: 'Miami Vice', logo: '/images/brands/miamivice.png' },
  { name: 'Jp Morgan', logo: '/images/brands/jpmorgan.png' },
  { name: 'Happy Dad', logo: '/images/brands/happydad.png' },
  { name: 'Ramp', logo: '/images/brands/ramp.png' },
  { name: '1001', logo: '/images/brands/1001.png' },
  { name: 'Betr', logo: '/images/brands/betr.png' },
  { name: 'Overtime Sports', logo: '/images/brands/overtime.png' },
  { name: 'Louis The Child', logo: '/images/brands/louisthechild.jpg' }
];

const reversedBrands = [...brands].reverse();

const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
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
    <section ref={containerRef} className="py-16 bg-white overflow-hidden">
      <motion.div style={{ opacity, y }}>
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <motion.div
            {...fadeInUpAnimation}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-4">
              Brands Who Trust Us
            </h2>
            <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
              Partnering with the finest names in luxury yachting to deliver exceptional experiences
            </p>
          </motion.div>
        </div>

        {/* Brands Carousel */}
        <div className="relative w-screen -mx-[50vw] left-1/2">
          {/* Gradient Overlays */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10" />

          {/* First Row */}
          <div className="flex space-x-8 animate-marquee py-4">
            {[...brands, ...brands, ...brands].map((brand, index) => (
              <BrandLogo key={`${brand.name}-${index}`} brand={brand} />
            ))}
          </div>

          {/* Second Row */}
          <div className="flex space-x-8 animate-marquee-reverse py-4 mt-4">
            {[...reversedBrands, ...reversedBrands, ...reversedBrands].map((brand, index) => (
              <BrandLogo key={`${brand.name}-reverse-${index}`} brand={brand} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative flex-shrink-0 group"
    >
      <div className="relative w-12 h-10 sm:w-16 sm:h-12 md:w-24 md:h-16 lg:w-32 lg:h-20 xl:w-40 xl:h-24 bg-white rounded-lg p-2 flex items-center justify-center border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300">
        <Image
          src={brand.logo}
          alt={brand.name}
          fill
          className="object-contain p-2"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="hidden sm:block absolute left-1/2 -translate-x-1/2 mt-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg pointer-events-none text-center min-w-[120px] border border-gray-100 z-20"
      >
        <p className="text-sm font-medium text-gray-900">{brand.name}</p>
      </motion.div>
    </motion.div>
  );
}