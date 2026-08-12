"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=25.85578602396197&ne_lng=-80.13217904641093&sw_lat=25.7090419531335&sw_lng=-80.31860792381018&zoom_level=13",
  },
  {
    name: "Fort Lauderdale",
    image: "/images/locations/fort-lauderdale.png",
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=26.342075651857815&ne_lng=-79.94274801289657&sw_lat=25.85493658661458&sw_lng=-80.27851766621689&zoom_level=13&page=1",
  },
  {
    name: "Naples",
    image: "/images/locations/naples.jpg",
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=26.78162320580448&ne_lng=-81.53055713088251&sw_lat=25.80900322954124&sw_lng=-82.20209643752314&zoom_level=13&page=1",
  },
  {
    name: "West Palm Beach",
    image: "/images/locations/west-palm.jpg",
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=27.20361325071068&ne_lng=-79.67871662569503&sw_lat=26.234574624628717&sw_lng=-80.35025593233566&zoom_level=13&page=1",
  },
  {
    name: "Connecticut",
    image: "/images/locations/conneticut.jpg",
    href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=42.52785484619885&ne_lng=-71.37854485044119&sw_lat=39.24828154025446&sw_lng=-74.06470207700369&zoom_level=13&page=1",
  },
  {
    name: "Bahamas",
    image: "/images/locations/bahamas.jpg",
    href: "/boats/search?near=The+Bahamas&ne_lat=26.590274469914576&ne_lng=-76.65761869261429&sw_lat=22.560024925745196&sw_lng=-79.35476224730179&zoom_level=8&center_lat=24.591364629076335&center_lng=-78.00619046995804&page=1",
  },
  {
    name: "Dominican Republic",
    image: "/images/locations/dominican-republic.jpg",
    href: "/boats/search?near=Dominican+Republic&ne_lat=27.00077435235987&ne_lng=-65.31237564053237&sw_lat=10.272085808139986&sw_lng=-76.10094985928237&zoom_level=6&center_lat=18.844302328127366&center_lng=-70.70666274990737&page=1",
  },
];

export default function LocationsSection() {
  const prefersReducedMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();

  const prevSlide = useCallback(() => api?.scrollPrev(), [api]);
  const nextSlide = useCallback(() => api?.scrollNext(), [api]);

  return (
    <section className="py-6 sm:py-16">
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
            <h2 className="text-2xl sm:text-4xl font-bold text-primary leading-tight">
              Explore Destinations
            </h2>
            <p className="text-foreground text-sm sm:text-base font-light max-w-md">
              Book a private charter in one of our main locations
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-light-main transition-colors hover:bg-slate-200"
              aria-label="Previous locations"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-light-main transition-colors hover:bg-slate-200"
              aria-label="Next locations"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
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
                className="max-w-[200px] basis-[200px] pl-3 sm:max-w-[230px] sm:basis-[230px] sm:pl-4 md:max-w-[250px] md:basis-[250px]"
              >
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.08, 0.4), duration: 0.5 }}
                >
                  {/* Same card grammar as BoatListingCard: rounded image,
                      text below — no overlay. */}
                  <Link href={location.href} className="group block">
                    {/* 3:2 like BoatListingCard (and Boatsetter's destination
                        tiles) — shorter than the old squares. */}
                    <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 200px, 250px"
                        priority={index < 3}
                        loading={index >= 3 ? "lazy" : undefined}
                      />
                    </div>
                    <h3 className="text-[15px] font-semibold text-primary">{location.name}</h3>
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
