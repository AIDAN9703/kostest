"use client";

import Image from "next/image";
import Link from "next/link";
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

// Shared framing applied IDENTICALLY to the background photo and the boat
// cutout so the two stay pixel-aligned. The composition is baked into the
// cropped images; a slight upward shift lifts the boat with the content.
//   scale = zoom · translate-x = right(+)/left(−) · translate-y = up(−)/down(+)
const FRAME_CLASS = "object-cover object-center";

// Quick-pick destinations — mirror the params SearchBar pushes so each chip
// behaves like a real location search.
const QUICK_LOCATIONS = [
  { label: "Miami", near: "Miami, FL, USA", ne_lat: 25.8557, ne_lng: -80.13, sw_lat: 25.709, sw_lng: -80.3 },
  { label: "Miami Beach", near: "Miami Beach, FL, USA", ne_lat: 25.87, ne_lng: -80.12, sw_lat: 25.77, sw_lng: -80.14 },
  { label: "Fort Lauderdale", near: "Fort Lauderdale, FL, USA", ne_lat: 26.21, ne_lng: -80.09, sw_lat: 26.06, sw_lng: -80.21 },
  { label: "Key West", near: "Key West, FL, USA", ne_lat: 24.5905, ne_lng: -81.7261, sw_lat: 24.521, sw_lng: -81.8113 },
  { label: "Bahamas", near: "Nassau, The Bahamas", ne_lat: 25.089, ne_lng: -77.28, sw_lat: 25.0, sw_lng: -77.506 },
] as const;

function locationHref(l: (typeof QUICK_LOCATIONS)[number]) {
  const params = new URLSearchParams({
    near: l.near,
    ne_lat: String(l.ne_lat),
    ne_lng: String(l.ne_lng),
    sw_lat: String(l.sw_lat),
    sw_lng: String(l.sw_lng),
    zoom_level: "13",
    page: "1",
  });
  return `/boats/search?${params.toString()}`;
}

export default function HeroSection() {
  return (
    /* Full-bleed hero, Boatsetter-scale height — well under a viewport so the
       content below peeks in. */
    <section
      className="relative h-[74vh] min-h-[560px] w-full overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Layer 1 — background photo (bright, no dark overlays) */}
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
        <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-black/35" />
      </div>

      {/* Layer 2 (z-10) — Eyebrow + Headline, centered & lifted. Behind the boat. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
        {/* Lift the headline clear of the boat cutout mid-frame */}
        <div className="-translate-y-[18vh] text-center sm:-translate-y-[16vh]">
          {/* Gold eyebrow */}
          <div className="animate-fade-in-up mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-linear-to-r from-transparent to-gold sm:w-12" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white sm:text-xs [text-shadow:0_1px_3px_rgba(0,0,0,0.65),0_2px_14px_rgba(0,0,0,0.8)]">
              Kings of the Sea
            </span>
            <span className="h-px w-8 bg-linear-to-l from-transparent to-gold sm:w-12" />
          </div>

          <h1 className="animate-fade-in-up [animation-delay:200ms] font-black leading-[0.95] tracking-tight text-white text-[2.6rem] sm:text-6xl md:text-7xl xl:text-8xl [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
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

      {/* Layer 3 (z-20) — boat cutout, crisp, on top of the headline. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <Image
          src="/images/boat-cutout1.png"
          alt=""
          aria-hidden
          fill
          className={FRAME_CLASS}
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Layer 4 (z-30) — search + quick locations, lifted into the lower-middle. */}
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
        <div className="pointer-events-auto w-full max-w-2xl translate-y-[16vh] sm:translate-y-[12vh]">
          {/* relative z-20 keeps the search + its dropdown above the chips below */}
          <div className="relative z-20 animate-fade-in-up [animation-delay:400ms]">
            <SearchBar />
          </div>

          {/* Quick location chips. Mobile: one swipeable row. Desktop: wraps + centered. */}
          <div className="relative z-10 mt-5 flex flex-nowrap items-center gap-2.5 overflow-x-auto pb-1 animate-fade-in-up [animation-delay:600ms] hide-scrollbar sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_12px_rgba(0,0,0,0.85)]">
              Popular
            </span>
            {QUICK_LOCATIONS.map((l) => (
              <Link
                key={l.label}
                href={locationHref(l)}
                className="shrink-0 whitespace-nowrap rounded-full border border-white/45 bg-white/20 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md transition [text-shadow:0_1px_6px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/30"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
