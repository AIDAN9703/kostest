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

// Client component for the interactive boat card
const BoatCard = ({ boat, index }: { boat: Boat; index: number }) => {
  return (
    <Card className="group relative overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white flex flex-col h-full rounded-3xl transition-shadow duration-500">
      <CardHeader className="p-0">
        <AspectRatio ratio={4/3} className="overflow-hidden">
          <Image
            src={boat.mainImage || boat.primaryPhotoAbsPath || '/images/boats/yacht1.jpg'}
            alt={boat.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {boat.homePort && boat.homePort !== 'N/A' && (
            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#1E293B]" />
                <span className="text-sm font-medium text-[#1E293B]">{boat.homePort}</span>
              </div>
            </div>
          )}

          <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-medium text-[#1E293B]">
              {formatCurrency(boat.hourlyRate)}/hr
            </span>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl bg-white/95 backdrop-blur-sm hover:bg-white/100 text-[#1E293B]"
            >
              <Link href={`/boats/${boat.id}`}>
                View Details
              </Link>
            </Button>
            <div className="flex items-center gap-2 bg-white/95 px-6 py-3 rounded-full backdrop-blur-sm">
              <Star className="w-4 h-4 text-[#1E293B]" />
              <span className="text-[#1E293B] font-medium">4.9</span>
            </div>
          </div>
        </AspectRatio>
      </CardHeader>

      <CardContent className="p-8 flex-1 flex flex-col">
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-medium text-[#1E293B] group-hover:text-primary transition-colors mb-2 truncate">
              {boat.name}
            </h3>
            <p className="text-gray-600 font-light tracking-wide truncate">
              {boat.category}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[#1E293B] flex-shrink-0 bg-gray-50 px-5 py-2.5 rounded-full">
            <Users className="w-4 h-4" />
            <span className="font-medium whitespace-nowrap text-sm">{boat.capacity || boat.numOfPassengers} Guests</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-8 pb-8 bg-white">
        <Button
          asChild
          size="lg"
          className="w-full rounded-full bg-[#1E293B] hover:bg-[#2C3E50] text-white text-base font-medium py-6 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href={`/boats/${boat.id}`}>
            Book Your Journey
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Server component for the overall section
const FeaturedFleet = ({ boats }: { boats: Boat[] }) => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-5xl md:text-6xl xl:text-7xl text-[#1E293B] mb-6">
            <span className="text-gold">Discover</span> Our Fleet
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
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
          <CarouselContent className="-ml-4 overflow-visible">
            {boats.map((boat, idx) => (
              <CarouselItem key={boat.id} className="pl-4 md:basis-1/2 lg:basis-1/3 overflow-visible">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <BoatCard boat={boat} index={idx} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {boats.length > 3 && (
            <>
              <CarouselPrevious className="left-4 lg:-left-12" />
              <CarouselNext className="right-4 lg:-right-12" />
            </>
          )}
        </Carousel>

        <motion.div 
          className="text-center mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button
            asChild
            size="lg"
            className="font-serif text-xl px-12 py-6 bg-[#1E293B] hover:bg-[#2C3E50] text-white rounded-full tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
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