'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Boat } from "@/types/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import BoatCard from "@/components/ui/boat-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  return (
    <section className="py-2 sm:py-4 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-4 sm:mb-6 md:mb-8"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
        </motion.div>

        <Carousel
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
                  <BoatCard boat={boat} index={idx} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {boats.length > 2 && (
            <>
              <CarouselPrevious className="left-1 sm:left-4 lg:-left-12 w-8 h-8 sm:w-10 sm:h-10" />
              <CarouselNext className="right-1 sm:right-4 lg:-right-12 w-8 h-8 sm:w-10 sm:h-10" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedFleet;