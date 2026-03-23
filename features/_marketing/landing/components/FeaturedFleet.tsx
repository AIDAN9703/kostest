"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BoatCard from "@/shared/components/ui/boat-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { BoatWithTiers } from "@/features/boats/boat.types";

interface FeaturedFleetProps {
  boats: BoatWithTiers[];
}

export default function FeaturedFleet({ boats }: FeaturedFleetProps) {
  const prefersReducedMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <section className="py-8 sm:py-16">
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-2"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight">
              The Featured Fleet
            </h2>
            <p className="text-foreground text-sm sm:text-base font-light max-w-md">
              Handpicked yachts for your next adventure
            </p>
          </div>

          {boats.length > 2 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 transition-all hover:scale-105"
                aria-label="Previous boats"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={scrollNext}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 transition-all hover:scale-105"
                aria-label="Next boats"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true }}
          className="w-full"
          aria-label="Featured fleet"
        >
          <CarouselContent className="-ml-3 sm:-ml-4 py-2">
            {boats.map((boat, idx) => (
              <CarouselItem
                key={boat.id}
                className="pl-3 sm:pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: Math.min(idx * 0.08, 0.4),
                    duration: 0.5,
                  }}
                >
                  <BoatCard boat={boat} index={idx} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
