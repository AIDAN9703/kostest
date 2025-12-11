'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Boat } from "@/shared/lib/types/types";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { Button } from "@/shared/components/ui/button";
import BoatCard from "@/shared/components/ui/boat-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

// Reusable animation variants for DRY code
const fadeInUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: (delay = 0) => ({ 
    duration: 0.5, 
    delay 
  })
};

// Server component for the overall section
const FeaturedFleet = ({ boats }: { boats: Boat[] }) => {
  const prefersReducedMotion = useReducedMotion();
  const [api, setApi] = React.useState<CarouselApi>();

  // Simple navigation functions
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  return (
    <section className="py-2 sm:py-4 relative overflow-hidden">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-4">
        <motion.div 
          className="text-center mb-4 sm:mb-6 md:mb-8"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
        </motion.div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="relative w-full overflow-visible"
        >
          <CarouselContent className="-ml-2 sm:-ml-4 overflow-visible py-2">
            {boats.map((boat, idx) => (
              <CarouselItem key={boat.id} className="pl-2 sm:pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3 overflow-visible">
                <motion.div
                  initial={fadeInUpAnimation.initial}
                  whileInView={fadeInUpAnimation.animate}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: Math.min(idx * 0.1, 0.3), duration: 0.5 }}
                >
                  <BoatCard boat={boat} index={idx}/>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Simplified Navigation Buttons */}
          {boats.length > 2 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-1 sm:left-4 lg:-left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-xs hover:shadow-md transition-shadow duration-200 border border-slate-200 z-10"
                aria-label="Previous boats"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-1 sm:right-4 lg:-right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-xs hover:shadow-md transition-shadow duration-200 border border-slate-200 z-10"
                aria-label="Next boats"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedFleet;