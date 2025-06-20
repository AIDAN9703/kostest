'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Brand {
  name: string;
  logo: string;
}

const brands: Brand[] = [
  { name: 'Miami Vice', logo: '/images/brands/miamivice.png' },
  { name: 'Bucketlisters', logo: '/images/brands/bucketlisters.png' },
  { name: 'Happy Dad', logo: '/images/brands/happydad.png' },
  { name: 'Ramp', logo: '/images/brands/ramp.png' },
  { name: 'Lobels', logo: '/images/brands/lobels.webp' },
  { name: '1001', logo: '/images/brands/1001.png' },
  { name: 'Airbnb', logo: '/images/brands/airbnb.webp' },
  { name: 'Fashion Week Haus', logo: '/images/brands/fwh.avif' },
  { name: 'Meduza(DJ)', logo: '/images/brands/meduza.png' },
  { name: 'Betr', logo: '/images/brands/betr.png' },
  { name: 'Overtime Sports', logo: '/images/brands/overtime.png' },
  { name: 'Louis The Child', logo: '/images/brands/louisthechild.jpg' }
];

const reversedBrands = [...brands].reverse();

export default function BrandsCarousel() {
  return (
    <section className="relative py-6 sm:py-12 font-poppins">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-primary leading-tight">
              Brands We Work With
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-lg font-light">
              Partnering with the finest names across all industries.
            </p>
          </div>
        </motion.div>

        {/* Brands Carousel */}
        <div className="relative mt-0">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling Containers */}
          <div className="overflow-hidden">
            {/* First Row */}
            <div className="flex animate-marquee whitespace-nowrap py-3">
              {[...brands, ...brands].map((brand, index) => (
                <BrandLogo key={`${brand.name}-${index}`} brand={brand} />
              ))}
            </div>

            {/* Second Row */}
            <div className="flex animate-marquee-reverse whitespace-nowrap py-3">
              {[...reversedBrands, ...reversedBrands].map((brand, index) => (
                <BrandLogo key={`${brand.name}-reverse-${index}`} brand={brand} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <div className="inline-flex items-center justify-center px-3 sm:px-4 md:px-6">
      <div className="relative w-20 h-16 sm:w-28 sm:h-20 md:w-36 md:h-28 bg-white rounded-lg p-2 flex items-center justify-center border border-gray-100/50 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
        <Image
          src={brand.logo}
          alt={brand.name}
          fill
          className="object-contain p-1.5"
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 144px"
        />
        <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors duration-300 rounded-lg" />
      </div>
    </div>
  );
}

// Add this to your globals.css
/*
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marquee-reverse {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

.animate-marquee {
  animation: marquee 25s linear infinite;
}

.animate-marquee-reverse {
  animation: marquee-reverse 25s linear infinite;
}
*/
