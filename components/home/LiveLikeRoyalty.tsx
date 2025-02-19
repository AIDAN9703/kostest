'use client';

import React from 'react';
import { motion } from "framer-motion";
import Image from "next/image";

const galleryImages = [
  {
    src: "/images/clients/stevewilldoit.png",
    alt: "Stevewilldoit",
    caption: "Stevewilldoit"
  },
  {
    src: "/images/clients/miami-dolphins.png",
    alt: "Miami Dolphins",
    caption: "Miami Dolphins"
  },
  {
    src: "/images/clients/miami-heat.png",
    alt: "Miami Heat",
    caption: "Miami Heat"
  },
  {
    src: "/images/clients/hannah-ann.png",
    alt: "Hannah Ann",
    caption: "Hannah Ann"
  },
  {
    src: "/images/clients/griffan-johnson.png",
    alt: "Joey Joy and Griffin Johnson",
    caption: "Joey Joy and Griffin Johnson"
  },
  {
    src: "/images/clients/king.png",
    alt: "D'Eriq King",
    caption: "D'Eriq King"
  }
] as const;

export default function LiveLikeRoyalty() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Decorative rope pattern */}
      <div className="absolute inset-0 bg-[url('/images/rope-pattern.png')] opacity-5" />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Title Section */}
          <motion.div 
            className="lg:sticky lg:top-8 lg:w-[400px] flex-shrink-0 z-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-bebas-neue text-6xl lg:text-8xl text-primary tracking-wide leading-none">
              Live Like
              <br />
              Royalty
            </h2>
            <p className="text-lg text-gray-600 mt-6 font-light">
              Leave behind the traditional notions of yachting. With us, you can expect a lively and relaxed
              ambiance where you can unwind, soak up the sun, and create amazing memories with your friends.
            </p>
          </motion.div>

          {/* Gallery Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {galleryImages.map((image, idx) => (
                <motion.div
                  key={image.src}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="transform rotate-[random(-2, 2)deg] transition-transform duration-300 hover:rotate-0 hover:-translate-y-2">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={600}
                      height={800}
                      className="w-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 