"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FaGoogle, FaStar } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";
import type { GoogleReview } from "@/features/_marketing/landing/actions/testimonials";

interface TestimonialsSectionProps {
  reviews: GoogleReview[];
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={cn("size-3.5", i < rating ? "text-gold" : "text-slate-200")}
        />
      ))}
    </div>
  );
}

/** Avatar with an initial-letter fallback for reviews without a photo. */
function Avatar({ review, size = 48 }: { review: GoogleReview; size?: number }) {
  if (review.profile_photo_url) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-gold/50"
        style={{ width: size, height: size }}
      >
        <Image
          src={review.profile_photo_url}
          alt={review.author_name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gold/15 font-black text-gold-deep ring-2 ring-gold/50"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {review.author_name.charAt(0).toUpperCase()}
    </div>
  );
}

/**
 * Guest stories — the loudest band on the page by scale and motion, not
 * color: giant gold quote glyph, one spotlight Google review at a time with
 * auto-rotation, and a full-bleed marquee of the rest gliding underneath.
 */
export default function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = reviews.length;
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // Auto-advance the spotlight; hold still while the reader hovers it.
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, [paused, count, next]);

  if (!count) return null;

  const spotlight = reviews[index];

  return (
    <section className="relative overflow-hidden py-10 sm:py-16">
      {/* Watermark crest, bottom-left */}
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 opacity-[0.05] sm:h-72 sm:w-72">
        <Image
          src="/icons/transparent-logo.png"
          alt=""
          aria-hidden
          fill
          className="object-contain"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-8">
        {/* ── Header: centered title + subtitle ── */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-primary leading-tight">
            The word on the water.
          </h2>
          <p className="mt-1 text-foreground text-sm sm:text-base font-light">
            Real reviews from guests who booked with us on Google
          </p>
        </div>

        {/* ── Spotlight quote ── */}
        <div
          className="relative mx-auto mt-14 max-w-3xl sm:mt-24"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {/* Giant quote glyph tucked behind the quote's first line */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-7 left-0 select-none font-serif text-[4.5rem] leading-none text-gold/35 sm:-left-4 sm:-top-12 sm:text-[7rem]"
          >
            &ldquo;
          </span>

          {/* Carousel: each review slides in from the right, exits left */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 56 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                <blockquote className="relative text-base font-semibold leading-snug tracking-tight text-foreground sm:text-xl sm:leading-snug">
                  {spotlight.text.length > 300
                    ? `${spotlight.text.slice(0, 300).trimEnd()}…`
                    : spotlight.text}
                </blockquote>

                <div className="mt-6 flex items-center gap-3.5">
                  <Avatar review={spotlight} size={40} />
                  <div>
                    <p className="text-sm font-semibold text-primary">{spotlight.author_name}</p>
                    <p className="text-xs text-slate-500">
                      {spotlight.relative_time_description}
                    </p>
                  </div>
                  <Stars rating={spotlight.rating} className="ml-auto [&_svg]:size-3" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {count > 1 && (
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous review"
                className="flex size-9 items-center justify-center rounded-full bg-foreground/10 text-primary transition hover:bg-foreground/15"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next review"
                className="flex size-9 items-center justify-center rounded-full bg-foreground/10 text-primary transition hover:bg-foreground/15"
              >
                <ChevronRight className="size-4" />
              </button>
              <div className="ml-2 flex items-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to review ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-7 bg-gold" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                    )}
                  />
                ))}
              </div>

              <a
                href="https://www.google.com/search?q=KOS+Yachts+Kings+of+the+Sea+Reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto hidden items-center gap-2 rounded-full bg-foreground/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-foreground/15 sm:inline-flex"
              >
                <FaGoogle className="size-3.5" />
                Read them all
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Full-bleed marquee ── */}
      <div className="relative mt-14 sm:mt-24">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-linear-to-r from-white to-transparent sm:w-28" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-linear-to-l from-white to-transparent sm:w-28" />

        <div className="overflow-hidden">
          <div className="flex animate-marquee items-stretch whitespace-normal py-1 hover:[animation-play-state:paused]">
            {[...reviews, ...reviews].map((review, i) => (
              <button
                type="button"
                key={`${review.author_name}-${i}`}
                onClick={() => setIndex(i % count)}
                className="mx-2 w-[250px] shrink-0 cursor-pointer rounded-2xl bg-light-main px-4 py-3.5 text-left transition-colors hover:bg-slate-200/70 sm:w-[280px]"
              >
                <div className="flex items-center gap-3">
                  <Avatar review={review} size={30} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {review.author_name}
                    </p>
                    <Stars rating={review.rating} className="[&_svg]:size-2.5" />
                  </div>
                </div>
                <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600">
                  {review.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile CTA (desktop version lives beside the dots) */}
      <div className="relative mt-8 text-center sm:hidden">
        <a
          href="https://www.google.com/search?q=KOS+Yachts+Kings+of+the+Sea+Reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-foreground/15"
        >
          <FaGoogle className="size-4" />
          Read them all on Google
        </a>
      </div>
    </section>
  );
}
