"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import BoatCard from "@/shared/components/ui/boat-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { getNearbyBoats } from "@/features/_marketing/landing/actions/nearby-boats";
import type { BoatWithTiers } from "@/features/boats/boat.types";

export default function NearbyBoats() {
  const [city, setCity] = useState<string | null>(null);
  const [boats, setBoats] = useState<BoatWithTiers[]>([]);
  const [visible, setVisible] = useState(false);
  const [api, setApi] = React.useState<CarouselApi>();

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    // Request location directly — the browser handles the permission prompt
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode for city name using the already-loaded Google Maps JS
        try {
          const geocoder = new google.maps.Geocoder();
          const response = await geocoder.geocode({
            location: { lat: latitude, lng: longitude },
          });
          const components = response.results[0]?.address_components;
          const cityName =
            components?.find((c) => c.types.includes("locality"))?.long_name ||
            components?.find((c) =>
              c.types.includes("administrative_area_level_1"),
            )?.long_name ||
            "You";
          setCity(cityName);
        } catch {
          setCity("You");
        }

        // Fetch nearby boats
        const result = await getNearbyBoats(latitude, longitude);
        if (result.success && result.data && result.data.length > 0) {
          setBoats(result.data);
          setVisible(true);
        }
      },
      (error) => {
        // Permission denied or error — section stays hidden
        // Permission denied or error — section stays hidden
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }, []);

  // Don't render anything until we have location + boats
  if (!visible || boats.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 relative overflow-hidden">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-4">
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-primary font-poppins text-left">
            Boats Near {city}
          </h2>
        </motion.div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: boats.length > 3 }}
          className="relative w-full overflow-visible"
        >
          <CarouselContent className="-ml-2 sm:-ml-4 overflow-visible py-2">
            {boats.map((boat, idx) => (
              <CarouselItem
                key={boat.id}
                className="pl-2 sm:pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3 overflow-visible"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(idx * 0.08, 0.4),
                    duration: 0.4,
                  }}
                >
                  <BoatCard boat={boat} index={idx} showLocation />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {boats.length > 3 && (
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
}
