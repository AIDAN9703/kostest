"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/shared/components/layouts/sub-components/SearchBar";
import { cn } from "@/shared/lib/utils/general-utils";

// Quick-pick destinations — mirror the params SearchBar pushes so each chip
// behaves like a real location search.
const QUICK_LOCATIONS = [
  {
    label: "Miami",
    near: "Miami, FL, USA",
    ne_lat: 25.8557,
    ne_lng: -80.13,
    sw_lat: 25.709,
    sw_lng: -80.3,
  },
  {
    label: "Miami Beach",
    near: "Miami Beach, FL, USA",
    ne_lat: 25.87,
    ne_lng: -80.12,
    sw_lat: 25.77,
    sw_lng: -80.14,
  },
  {
    label: "Fort Lauderdale",
    near: "Fort Lauderdale, FL, USA",
    ne_lat: 26.21,
    ne_lng: -80.09,
    sw_lat: 26.06,
    sw_lng: -80.21,
  },
  {
    label: "Key West",
    near: "Key West, FL, USA",
    ne_lat: 24.5905,
    ne_lng: -81.7261,
    sw_lat: 24.521,
    sw_lng: -81.8113,
  },
  {
    label: "Bahamas",
    near: "Nassau, The Bahamas",
    ne_lat: 25.089,
    ne_lng: -77.28,
    sw_lat: 25.0,
    sw_lng: -77.506,
  },
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

/**
 * Boatsetter-style docking search. Only the BAR is sticky — pulled up over
 * the hero with a negative margin, pinned at `top: -1px` once scrolled, with
 * an IntersectionObserver (threshold 1; the -1px means a stuck bar is never
 * fully visible) flipping `docked`. Docking fades the white nav chrome in
 * first, then the bar shrinks/widens into it (staggered transitions). The
 * location chips are ordinary flow content below the bar, so they simply
 * scroll away underneath — the wrapper's height barely changes and content
 * below never jumps. The home navbar is non-sticky, so the docked bar takes
 * its place.
 */
export default function HeroSearchDock() {
  const [docked, setDocked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setDocked(entry.intersectionRatio < 1), {
      threshold: [1],
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── Sticky bar ── */}
      {/* Pull-up is PX, not vh: the dock's own height is px-sized, so a vh
          margin desyncs under browser zoom (zooming out shrinks px content
          but not vh) and the sections below climb up onto the hero. Px units
          keep the pull-up and the dock height in lockstep at any zoom. */}
      <div ref={ref} className="sticky top-[-1px] z-40 -mt-42">
        {/* Nav chrome fades in FIRST (no delay)… */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 border-b border-gray-200 bg-white",
            docked
              ? "opacity-100 transition-opacity duration-200"
              : "pointer-events-none opacity-0 transition-none"
          )}
        />

        {/* …then the content shrinks into place (delayed). */}
        <div
          className={cn(
            "relative mx-auto flex w-full items-center",
            docked
              ? "gap-3 px-4 py-2.5 transition-all delay-100 duration-300 sm:px-6 sm:py-2 lg:px-8"
              : "max-w-[44rem] px-4 transition-none sm:px-0"
          )}
        >
          {/* Logo docks in hard-left at navbar size — width animates so the
              search slides over instead of jumping. */}
          <Link
            href="/"
            aria-label="Home"
            className={cn(
              "hidden shrink-0 overflow-hidden rounded-full hover:opacity-80 sm:block",
              docked
                ? "w-12 opacity-100 transition-all delay-100 duration-300"
                : "pointer-events-none w-0 opacity-0 transition-none"
            )}
          >
            <Image
              src="/icons/transparent-logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="filter-blue rounded-full"
            />
          </Link>

          <div
            className={cn(
              "min-w-0 flex-1 animate-fade-in-up [animation-delay:400ms]",
              docked ? "mx-auto max-w-3xl transition-all delay-100 duration-300" : "transition-none"
            )}
          >
            <SearchBar size={docked ? "slim" : "default"} />
          </div>

          {/* Right spacer mirrors the logo's width + animation, so the search
              stays centered on the VIEWPORT (not the space right of the logo)
              and expands outward evenly while docking — without this it lands
              off-center and reads as a sideways glitch at the breakpoint. */}
          <div
            aria-hidden
            className={cn(
              "hidden shrink-0 sm:block",
              docked
                ? "w-12 transition-all delay-100 duration-300"
                : "w-0 transition-none"
            )}
          />
        </div>
      </div>

      {/* ── Location chips — plain flow content; they scroll under the bar ── */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-0">
        <div className="mt-5 flex flex-nowrap items-center gap-2.5 overflow-x-auto pb-1 animate-fade-in-up [animation-delay:600ms] hide-scrollbar sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_12px_rgba(0,0,0,0.85)]">
            Popular
          </span>
          {QUICK_LOCATIONS.map((l) => (
            <Link
              key={l.label}
              href={locationHref(l)}
              className="shrink-0 whitespace-nowrap rounded-full bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_10px_rgba(15,40,60,0.18)] backdrop-blur-2xl backdrop-saturate-150 transition hover:-translate-y-0.5 hover:bg-white/85"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
