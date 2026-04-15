"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { AspectRatio } from "@/shared/components/ui/aspect-ratio";
import { cn } from "@/shared/lib/utils/general-utils";
import { Image as IKImage } from "@imagekit/next";
import { getImageKitProps } from "@/shared/lib/services/imagekit.service";
import { getBoatStartingHourlyLabel } from "@/shared/lib/utils/pricing-utils";
import { BoatWithTiers } from "@/features/boats/boat.types";

interface BoatCardProps {
  boat: BoatWithTiers;
  index?: number;
  variant?: "default" | "search" | "featured" | "compact";
  showRating?: boolean;
  showDetails?: boolean;
  showPrice?: boolean;
  showLocation?: boolean;
  showInstantBook?: boolean;
  imagePriority?: boolean;
  aspectRatio?: number;
  highlightFeatured?: boolean;
  className?: string;
}

const BoatCard = ({
  boat,
  index = 0,
  variant = "default",
  showRating = true,
  showDetails = true,
  showPrice = true,
  showLocation = true,
  showInstantBook = true,
  imagePriority,
  aspectRatio = 16 / 9,
  highlightFeatured = true,
  className = "",
}: BoatCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = [boat.mainImage, ...(boat.galleryImages || [])].filter(Boolean);
  const hasImages = images.length > 0;
  const currentImageUrl = hasImages ? images[currentImageIndex] : null;

  const handleImageNavigation = (direction: "prev" | "next") => {
    setCurrentImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % images.length;
      return (prev - 1 + images.length) % images.length;
    });
  };

  const hasRating = showRating && (boat.averageRating != null || (boat.totalReviews ?? 0) > 0);
  const hasLocation = showLocation && boat.locationLabel && boat.locationLabel !== "N/A";

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const radius = isCompact ? "rounded-xl" : isFeatured ? "rounded-3xl" : "rounded-2xl";
  const padding = isCompact ? "px-3 py-2.5" : isFeatured ? "px-5 py-4" : "px-4 py-3";
  const titleSize = isCompact
    ? "text-sm font-semibold"
    : isFeatured
      ? "text-lg font-semibold"
      : "text-base font-semibold";
  const metaSize = isCompact ? "text-[10px]" : "text-xs";

  return (
    <Link href={`/boats/${boat.id}`} className="block h-full">
      <div
        className={cn(
          "group relative bg-white flex flex-col h-full transition-all duration-300 ease-out font-poppins overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5",
          radius,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative">
          <AspectRatio ratio={aspectRatio} className="overflow-hidden">
            {hasImages ? (
              (() => {
                const props = getImageKitProps(currentImageUrl!, "card", {
                  eager: index < 3 || !!imagePriority,
                });
                return (
                  <IKImage
                    src={props.src}
                    alt={boat.displayTitle || boat.name}
                    width={props.width}
                    height={props.height}
                    sizes={props.sizes}
                    loading={props.loading}
                    fetchPriority={props.fetchPriority}
                    transformation={props.transformation}
                    className="object-cover w-full h-full"
                    style={{ position: "absolute", inset: 0 }}
                  />
                );
              })()
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-14 h-14 mb-3 opacity-40">
                  <Image
                    src="/icons/updatekoslogo-branded.png"
                    alt="KOS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-slate-400 font-medium text-sm">Images coming soon</p>
              </div>
            )}

            {/* Instant Book badge */}
            {showInstantBook && boat.instantBook && (
              <div className="absolute top-3 left-3 z-20">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-white pl-1.5 pr-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                  <Image
                    src="/icons/instant-book-small.svg"
                    width={14}
                    height={14}
                    alt=""
                    className="brightness-0 invert"
                  />
                  Instant Book
                </span>
              </div>
            )}

            {/* Featured badge */}
            {boat.featured && highlightFeatured && !boat.instantBook && (
              <div className="absolute top-3 left-3 z-20">
                <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full shadow-md">
                  Featured
                </span>
              </div>
            )}

            {/* Image nav arrows */}
            {isHovered && images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageNavigation("prev");
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageNavigation("next");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium z-10">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Price tag */}
            {showPrice && (
              <div className="absolute bottom-3 right-3 bg-white text-p px-2 py-1 rounded-sm text-sm font-semibold shadow-md z-10">
                {getBoatStartingHourlyLabel(boat)}
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Content - fully stacked, no side-by-side columns */}
        {showDetails && (
          <div className={cn("flex-1 flex flex-col gap-0.5", padding)}>
            {/* Row 1: Location + Rating */}
            <div className="flex items-center justify-between gap-2">
              {hasLocation ? (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-muted-foreground uppercase tracking-wider truncate",
                    isCompact ? "text-[8px]" : "text-[10px]"
                  )}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate">{boat.locationLabel}</span>
                </span>
              ) : (
                <span />
              )}

              {hasRating && (
                <span
                  className={cn(
                    "flex items-center gap-1 shrink-0 text-foreground",
                    isCompact ? "text-[10px]" : "text-xs"
                  )}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{boat.averageRating?.toFixed(1) ?? "--"}</span>
                  {(boat.totalReviews ?? 0) > 0 && (
                    <span className="text-muted-foreground">({boat.totalReviews})</span>
                  )}
                </span>
              )}
            </div>

            {/* Row 2: Title (full width, always) */}
            <h3
              className={cn(
                "text-primary group-hover:text-primary transition-colors line-clamp-1 leading-snug",
                titleSize
              )}
            >
              {boat.displayTitle || boat.name}
            </h3>

            {/* Row 3: Metadata line */}
            {boat.capacity != null && boat.capacity > 0 && (
              <p className={cn("text-muted-foreground flex items-center gap-1", metaSize)}>
                <Users className="w-3 h-3" />
                Up to {boat.capacity} guests
                {boat.crewRequired && <span> &bull; Captained</span>}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default BoatCard;
