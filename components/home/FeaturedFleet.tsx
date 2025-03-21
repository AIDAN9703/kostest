'use client';

import React, { useOptimistic, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Boat } from "@/types/types";
import { Anchor, Users, MapPin, Star, Ruler, DoorOpenIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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

// Client component for the interactive boat card
const BoatCard = ({ boat, index }: { boat: Boat; index: number }) => {
  return (
    <Card className="group relative overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white flex flex-col h-full rounded-xl sm:rounded-2xl md:rounded-3xl transition-shadow duration-500">
      <CardHeader className="p-0">
        <AspectRatio ratio={4/3} className="overflow-hidden">
          <Image
            src={boat.mainImage || boat.primaryPhotoAbsPath || '/images/boats/yacht1.jpg'}
            alt={boat.displayTitle || boat.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
            <span className="text-sm sm:text-base font-medium text-[#1E293B]">
              {formatCurrency(boat.hourlyRate)}+<span className="text-xs sm:text-sm text-gray-500">/hour</span>
            </span>
          </div>
        </AspectRatio>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-[#1E293B] group-hover:text-primary transition-colors mb-1 sm:mb-2 truncate">
              {boat.displayTitle || boat.name}
            </h3>
            
            {boat.homePort && boat.homePort !== 'N/A' && (
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600 mb-1 sm:mb-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-light tracking-wide">{boat.homePort}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-light tracking-wide">{boat.capacity || boat.numOfPassengers} Guests</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 text-[#1E293B]">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            <span className="text-sm sm:text-base font-medium">4.9</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 bg-white">
        <Button
          asChild
          size="lg"
          className="w-full rounded-full border-2 border-[#1E293B] text-[#1E293B] 
                   hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent 
                   text-sm sm:text-base md:text-lg font-serif py-2 sm:py-3 md:py-4 h-auto"
        >
          <Link href={`/boats/${boat.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Server component for the overall section
const FeaturedFleet = ({ boats }: { boats: Boat[] }) => {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-10 sm:mb-16 md:mb-24"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition()}
        >
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="h-[2px] w-16 sm:w-20 bg-gold" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1E293B] mb-3 sm:mb-4 md:mb-6">
            <span className="text-gold">Discover</span> Our Fleet
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Explore our curated collection of luxury vessels, each promising an unforgettable journey on the open waters.
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="relative w-full overflow-visible"
        >
          <CarouselContent className="-ml-2 sm:-ml-4 overflow-visible">
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

        <motion.div 
          className="text-center mt-10 sm:mt-16 md:mt-24"
          initial={fadeInUpAnimation.initial}
          whileInView={fadeInUpAnimation.animate}
          viewport={{ once: true }}
          transition={fadeInUpAnimation.transition(0.5)}
        >
          <Button
            asChild
            size="lg"
            className="font-serif text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 rounded-full border-2 border-[#1E293B] text-[#1E293B] 
                     hover:bg-[#1E293B] hover:text-white transition-all duration-300 bg-transparent h-auto"
          >
            <Link href="/boats">
              View All Vessels
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedFleet;