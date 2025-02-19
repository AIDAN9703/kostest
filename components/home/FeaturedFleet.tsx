'use client';

import React, { useOptimistic, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Boat } from "@/lib/types";
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
  const highlightedFeatures = boat.features.slice(0, 3);

  return (
    <Card className="group relative overflow-hidden shadow-lg bg-white flex flex-col h-full">
      <CardHeader className="p-0">
        <AspectRatio ratio={4/3} className="overflow-hidden rounded-t-lg">
          <Image
            src={boat.primaryPhotoAbsPath || '/images/boats/yacht1.jpg'}
            alt={boat.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {boat.homePort && boat.homePort !== 'N/A' && (
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">{boat.homePort}</span>
              </div>
            </div>
          )}

          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-lg font-semibold text-primary">
              {formatCurrency(boat.hourlyRate)}/hr
            </span>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl"
            >
              <Link href={`/boats/${boat.id}`}>
                View Details
              </Link>
            </Button>
            <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-medium">4.9</span>
            </div>
          </div>
        </AspectRatio>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col gap-6">
        <div>
          <h3 className="font-bebas-neue text-4xl text-gray-900 group-hover:text-primary transition-colors tracking-wide mb-2">
            {boat.name}
          </h3>
          <p className="text-gray-600 font-medium uppercase tracking-wider text-sm">{boat.category}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium">{boat.numOfPassengers} Guests</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Ruler className="w-5 h-5 text-primary" />
            <span className="font-medium">{boat.lengthFt}ft Length</span>
          </div>
          {boat.sleepsNum && boat.sleepsNum > 0 && (
            <div className="flex items-center gap-3 text-gray-700">
              <Anchor className="w-5 h-5 text-primary" />
              <span className="font-medium">Sleeps {boat.sleepsNum}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-700">
            <DoorOpenIcon className="w-5 h-5 text-primary" />
            <span className="font-medium">{boat.numOfCabins || 0} Cabins</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
            Highlighted Features
          </h4>
          <ul className="space-y-1.5">
            {highlightedFeatures.map((feature, idx) => (
              <li key={idx} className="text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="p-6">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full rounded-2xl border-2 border-primary hover:bg-primary hover:text-white"
        >
          <Link href={`/boats/${boat.id}`}>
            Book Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Server component for the overall section
const FeaturedFleet = ({ boats }: { boats: Boat[] }) => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bebas-neue text-5xl md:text-6xl xl:text-7xl text-primary mb-6 tracking-wide">
            Featured Yachts
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Discover our handpicked selection of luxury vessels, each offering an unmatched blend of comfort, style, and maritime excellence.
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="relative w-full"
        >
          <CarouselContent className="-ml-4">
            {boats.map((boat, idx) => (
              <CarouselItem key={boat.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <BoatCard boat={boat} index={idx} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {boats.length > 3 && (
            <>
              <CarouselPrevious className="left-2 lg:-left-10" />
              <CarouselNext className="right-2 lg:-right-10" />
            </>
          )}
        </Carousel>

        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button
            asChild
            size="lg"
            className="font-bebas-neue text-2xl px-16 py-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-full tracking-wider shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/boats">
              View All Yachts
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedFleet;