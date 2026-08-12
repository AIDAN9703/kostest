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
    /* Extra bottom padding so the marquee doesn't butt straight into the
       navy inquiry band that follows. */
    <section className="pt-6 pb-10 sm:pt-16 sm:pb-24">
      <div className="w-full">
        {/* Header — right-aligned to alternate with Explore Destinations */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-right"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-primary leading-tight">
            Brands Who Trust Us
          </h2>
          <p className="ml-auto max-w-md text-foreground text-sm sm:text-base font-light">
            Partnering with the finest names across all industries
          </p>
        </motion.div>

        {/* Two counter-scrolling rows — bare full-color logos, no boxes */}
        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-linear-to-r from-white to-transparent sm:w-24" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-linear-to-l from-white to-transparent sm:w-24" />

          <div className="space-y-6 overflow-hidden">
            <div className="flex animate-marquee items-center whitespace-nowrap py-1">
              {[...brands, ...brands].map((brand, index) => (
                <BrandLogo key={`${brand.name}-${index}`} brand={brand} />
              ))}
            </div>
            <div className="flex animate-marquee-reverse items-center whitespace-nowrap py-1">
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
    <div className="inline-flex items-center justify-center px-5 sm:px-7 md:px-8">
      <div className="relative h-12 w-24 sm:h-14 sm:w-32">
        <Image
          src={brand.logo}
          alt={brand.name}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 96px, 128px"
        />
      </div>
    </div>
  );
}
