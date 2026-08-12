"use client";

import Image from "next/image";
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

// Hero photo crop: lowering the object-position Y% slides the visible
// content DOWN in the frame — tuned so the boat rides between the headline
// and the search bar at the Boatsetter-short hero height.
const FRAME_CLASS = "object-cover object-[center_38%]";

export default function HeroSection() {
  return (
    /* Full-bleed hero, Boatsetter-scale height — well under a viewport so the
       content below peeks in. */
    <section
      className="relative h-[50vh] min-h-[440px] sm:h-[60vh] sm:min-h-[480px] w-full overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Luxury yacht cruising past the Miami skyline"
          fill
          className={FRAME_CLASS}
          priority
          sizes="100vw"
          quality={85}
        />
        {/* Very subtle darkening at the top and bottom only — keeps the water
            and boat bright while helping the text read a little better. */}
        <div className="absolute inset-0 bg-linear-to-b from-black/8 via-transparent to-black/12" />
      </div>

      {/* Eyebrow + Headline, centered & lifted above the boat in the photo. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
        <div className="-translate-y-[13vh] text-center sm:-translate-y-[16vh]">
          {/* Gold eyebrow */}
          <div className="animate-fade-in-up mb-6 sm:mb-2 flex items-center justify-center gap-3">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white sm:text-xs [text-shadow:0_1px_3px_rgba(0,0,0,0.65),0_2px_14px_rgba(0,0,0,0.8)]">
              Kings of the Sea
            </span>
          </div>

          <h1 className="animate-fade-in-up [animation-delay:200ms] font-black leading-[1.02] tracking-tight text-white text-3xl sm:text-5xl md:text-6xl xl:text-7xl [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
            Find Your Perfect
            <br />
            <span className="mt-2 inline-block min-h-[1.1em] align-top">
              <span className="text-white">
                <TypeAnimation
                  sequence={TYPE_SEQUENCE}
                  wrapper="span"
                  speed={20}
                  deletionSpeed={30}
                  repeat={Infinity}
                  cursor={false}
                  preRenderFirstString={true}
                />
              </span>
              <span className="text-white"> Experience</span>
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
