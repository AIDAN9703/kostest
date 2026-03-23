"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

interface Brand {
  name: string;
  logo: string;
}

const brands: Brand[] = [
  { name: "Miami Vice", logo: "/images/brands/miamivice.png" },
  { name: "Bucketlisters", logo: "/images/brands/bucketlisters.png" },
  { name: "Happy Dad", logo: "/images/brands/happydad.png" },
  { name: "Ramp", logo: "/images/brands/ramp.png" },
  { name: "Lobels", logo: "/images/brands/lobels.webp" },
  { name: "1001", logo: "/images/brands/1001.png" },
  { name: "Airbnb", logo: "/images/brands/airbnb.webp" },
  { name: "Fashion Week Haus", logo: "/images/brands/fwh.avif" },
  { name: "Meduza(DJ)", logo: "/images/brands/meduza.png" },
  { name: "Betr", logo: "/images/brands/betr.png" },
  { name: "Overtime Sports", logo: "/images/brands/overtime.png" },
  { name: "Louis The Child", logo: "/images/brands/louisthechild.jpg" },
];

const reversedBrands = [...brands].reverse();

export default function BrandsCarousel() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-8 sm:py-16 bg-white">
      <div className="w-full">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
            Brands Who Trust Us
          </h2>
          <p className=" text-foreground mt-2 text-sm sm:text-base font-light max-w-lg mx-auto">
            Partnering with the some of the finest names across all industries
          </p>
        </motion.div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden space-y-4">
            {/* Row 1 */}
            <div className="flex animate-marquee whitespace-nowrap py-2">
              {[...brands, ...brands].map((brand, index) => (
                <BrandLogo key={`${brand.name}-${index}`} brand={brand} />
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex animate-marquee-reverse whitespace-nowrap py-2">
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
    <div className="inline-flex items-center justify-center px-3 sm:px-5 md:px-6">
      <div className="relative w-24 h-20 sm:w-32 sm:h-24 md:w-40 md:h-28 bg-white rounded-xl p-3 flex items-center justify-center border border-gray-100 hover:border-gold/30 shadow-sm hover:shadow-md transition-all duration-300">
        <Image
          src={brand.logo}
          alt={brand.name}
          fill
          className="object-contain p-2.5"
          sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
        />
      </div>
    </div>
  );
}
