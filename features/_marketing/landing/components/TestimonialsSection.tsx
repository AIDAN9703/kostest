"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url: string;
  relative_time_description: string;
}

interface TestimonialsSectionProps {
  reviews: Review[];
}

// Simple star rating component
const StarRating = React.memo(({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      />
    ))}
  </div>
));

StarRating.displayName = "StarRating";

// Simple review card component
const ReviewCard = React.memo(({ review }: { review: Review }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
    <div className="flex items-start mb-4">
      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 shrink-0">
        <Image
          src={review.profile_photo_url}
          alt={review.author_name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">
          {review.author_name}
        </h3>
        <p className="text-sm text-gray-600">
          {review.relative_time_description}
        </p>
      </div>
    </div>

    <div className="flex-1">
      <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">
        {review.text}
      </p>
      <StarRating rating={review.rating} />
    </div>
  </div>
));

ReviewCard.displayName = "ReviewCard";

export default function TestimonialsSection({
  reviews,
}: TestimonialsSectionProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  // Simple responsive logic
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1280) setVisibleCount(3);
      else if (window.innerWidth >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const visibleReviews = reviews.slice(startIndex, startIndex + visibleCount);

  const nextSlide = useCallback(() => {
    setStartIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setStartIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index: number) => {
    setStartIndex(index);
  }, []);

  if (!reviews.length) {
    return (
      <div className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">No Reviews Available</h2>
          <p className="opacity-80">Reviews will appear here soon.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative bg-primary text-white overflow-hidden py-16">
      {/* Background Logo */}
      <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 opacity-10">
        <Image
          src="/icons/transparent-white-logo.webp"
          alt="KOS Background Logo"
          fill
          className="object-contain"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl opacity-90">
            Real experiences from real customers
          </p>
        </div>

        <div className="relative">
          {/* Navigation buttons - only show if needed */}
          {reviews.length > visibleCount && (
            <>
              <button
                onClick={prevSlide}
                className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Reviews grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleReviews.map((review, index) => (
              <div
                key={`${startIndex}-${index}`}
                className="opacity-0 animate-fade-in-up"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          {reviews.length > visibleCount && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    startIndex === index
                      ? "bg-white w-6"
                      : "bg-white/40 w-2 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Google Reviews Button */}
          <div className="text-center mt-12">
            <a
              href="https://www.google.com/search?q=KOS+Yachts+Kings+of+the+Sea+Reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 transition-colors py-3 px-6 rounded-full font-medium"
            >
              <FaGoogle className="w-5 h-5" />
              <span>View More on Google</span>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
