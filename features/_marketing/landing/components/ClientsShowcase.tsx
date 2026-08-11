"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram } from "lucide-react";

const clientImages = [
  { url: "/clients/beachday.jpeg", title: "Beach Day", span: "col-span-2 row-span-2" },
  { url: "/clients/bernie.JPG", title: "Deep Sea Adventure", span: "col-span-1 row-span-1" },
  { url: "/clients/king.JPG", title: "Luxury Yacht", span: "col-span-1 row-span-1" },
  { url: "/clients/girls.jpg", title: "Friends Celebration", span: "col-span-1 row-span-1" },
  { url: "/clients/backflip.JPG", title: "Backflip", span: "col-span-1 row-span-2" },
  { url: "/images/boats/aerial6.jpg", title: "Group Fun", span: "col-span-1 row-span-1" },
  { url: "/clients/jetski.jpeg", title: "Jetski", span: "col-span-1 row-span-1" },
  { url: "/clients/niceyacht.jpg", title: "Ocean Royalty", span: "col-span-1 row-span-1" },
];

export default function ClientsShowcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-8 sm:py-16 relative overflow-hidden">
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-right mb-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary leading-tight">
            Real People. Real Adventures.
          </h2>
          <p className="text-foreground text-sm sm:text-base font-light max-w-md ml-auto">
            See what our guests experience on the water
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[180px] gap-3 sm:gap-4">
          {clientImages.map((image, idx) => (
            <motion.div
              key={image.url}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: Math.min(idx * 0.06, 0.4) }}
              className={`${image.span} relative rounded-2xl overflow-hidden group`}
            >
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                quality={80}
                loading={idx < 4 ? "eager" : "lazy"}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Instagram Link */}
        <div className="mt-6 text-center">
          <a
            href="https://instagram.com/kosyachts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            <Instagram className="w-4 h-4" />
            @kosyachts
          </a>
        </div>
      </div>
    </section>
  );
}
