"use client";

import Image from "next/image";
import SearchBar from "@/shared/components/layouts/sub-components/SearchBar";
import { TypeAnimation } from "react-type-animation";

// Pre-compute the sequence once outside component
const TYPE_SEQUENCE = [
  "Yacht",
  5000,
  "Boat",
  5000,
  "Luxury",
  5000,
  "Family",
  5000,
  "Corporate",
  5000,
  "Birthday",
  3000,
] as (string | number)[];

export default function HeroSection() {
  return (
    <section
      className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/herooption22.jpg"
          alt="Luxury yachts in crystal clear waters"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60 opacity-50" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center py-8 sm:py-12 md:py-16 space-y-4">
        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full text-white text-center">
          {/* Main Heading with fixed height container */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight">
              Find Your Perfect
              <br />
              {/* Fixed height container to prevent layout shifts */}
              <span className="bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent inline-block min-h-[1.2em]">
                <TypeAnimation
                  sequence={TYPE_SEQUENCE}
                  wrapper="span"
                  speed={20}
                  deletionSpeed={30}
                  repeat={Infinity}
                  cursor={false}
                  preRenderFirstString={true}
                />
                {" Experience"}
              </span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="w-full mt-8 sm:mt-12 md:mt-16 lg:mt-24">
            <SearchBar />
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-white mt-2 sm:mt-4 md:mt-6">
            Discover unforgettable boat and yacht charters with experienced crew worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
