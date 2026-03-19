"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/shared/components/ui/carousel";

const locations = [
  {
    name: "Miami",
    image: "/images/locations/miami.jpg",
    boatCount: 15,
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=25.85578602396197&ne_lng=-80.13217904641093&sw_lat=25.7090419531335&sw_lng=-80.31860792381018&zoom_level=13&map_toggle=on",
  },
  {
    name: "Fort Lauderdale",
    image: "/images/locations/fort-lauderdale.png",
    boatCount: 12,
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=26.342075651857815&ne_lng=-79.94274801289657&sw_lat=25.85493658661458&sw_lng=-80.27851766621689&zoom_level=13&map_toggle=on&page=1",
  },
  {
    name: "Naples",
    image: "/images/locations/naples.jpg",
    boatCount: 8,
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=26.78162320580448&ne_lng=-81.53055713088251&sw_lat=25.80900322954124&sw_lng=-82.20209643752314&zoom_level=13&map_toggle=on&page=1",
  },
  {
    name: "West Palm Beach",
    image: "/images/locations/west-palm.jpg",
    boatCount: 10,
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=27.20361325071068&ne_lng=-79.67871662569503&sw_lat=26.234574624628717&sw_lng=-80.35025593233566&zoom_level=13&map_toggle=on&page=1",
  },
  {
    name: "Connecticut",
    image: "/images/locations/conneticut.jpg",
    boatCount: 5,
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=42.52785484619885&ne_lng=-71.37854485044119&sw_lat=39.24828154025446&sw_lng=-74.06470207700369&zoom_level=13&map_toggle=on&page=1",
  },
  {
    name: "Bahamas",
    image: "/images/locations/bahamas.jpg",
    boatCount: 6,
    href: "/boats/search?near=The+Bahamas&ne_lat=26.590274469914576&ne_lng=-76.65761869261429&sw_lat=22.560024925745196&sw_lng=-79.35476224730179&zoom_level=8&map_toggle=on&center_lat=24.591364629076335&center_lng=-78.00619046995804&page=1",
  },
  {
    name: "Dominican Republic",
    image: "/images/locations/dominican-republic.jpg",
    boatCount: 4,
    href: "/boats/search?near=Dominican+Republic&ne_lat=27.00077435235987&ne_lng=-65.31237564053237&sw_lat=10.272085808139986&sw_lng=-76.10094985928237&zoom_level=6&map_toggle=on&center_lat=18.844302328127366&center_lng=-70.70666274990737&page=1",
  },
];

export default function LocationsSection() {
  const prefersReducedMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();

  const prevSlide = useCallback(() => api?.scrollPrev(), [api]);
  const nextSlide = useCallback(() => api?.scrollNext(), [api]);

  return (
    <section className="py-8 sm:py-16 font-poppins">
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-4"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-primary leading-tight">
              Explore Destinations
            </h2>
            <p className="text-foreground text-sm sm:text-base font-light max-w-md">
              Book a private charter in one of our main locations
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 transition-all hover:scale-105"
              aria-label="Previous locations"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 transition-all hover:scale-105"
              aria-label="Next locations"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true }}
          className="w-full"
          aria-label="Available locations"
        >
          <CarouselContent className="-ml-3 sm:-ml-4">
            {locations.map((location, index) => (
              <CarouselItem
                key={location.name}
                className="pl-3 sm:pl-4 basis-[260px] sm:basis-[300px] md:basis-[320px] max-w-[260px] sm:max-w-[300px] md:max-w-[320px]"
              >
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.08, 0.4), duration: 0.5 }}
                >
                  <Link
                    href={location.href}
                    className="block group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <div className="relative aspect-[1/1]">
                      <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 260px, 320px"
                        priority={index < 3}
                        loading={index >= 3 ? "lazy" : undefined}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 w-full p-5">
                        <h3 className="text-2xl font-semibold text-white">{location.name}</h3>
                        <div className="flex items-center gap-1.5 text-white/70 text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{location.boatCount} yachts available</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
