'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boat } from "@/shared/types/types";
import { Users, MapPin, Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { formatCurrency } from "@/shared/utils/general-utils";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { AspectRatio } from "@/shared/components/ui/aspect-ratio";
import { cn } from "@/shared/utils/general-utils";
import { Image as IKImage } from "@imagekit/next";
import { getImageKitProps } from "@/shared/services/imagekit.service";
import { getBoatStartingHourlyLabel } from "@/shared/utils/pricing-utils";

interface BoatCardProps {
  boat: Boat;
  index?: number;
  variant?: 'default' | 'search' | 'featured' | 'compact';
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
  variant = 'default',
  showRating = true,
  showDetails = true,
  showPrice = true,
  showLocation = true,
  showInstantBook = true,
  imagePriority,
  aspectRatio = 16/9,
  highlightFeatured = true,
  className = ""
}: BoatCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Get all available images
  const images = [
    boat.mainImage,
    ...(boat.galleryImages || []),
  ].filter(Boolean);

  // If no images are available, use our custom fallback
  const hasImages = images.length > 0;

  // Get the current image
  const currentImageUrl = hasImages ? images[currentImageIndex] : null;

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % images.length;
      }
      return (prev - 1 + images.length) % images.length;
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Here you would typically call an API to save the favorite status
  };

  // Simple variant-based classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'search':
        return {
          card: "rounded-xl hover:scale-[1.01]",
          content: "p-2 sm:p-3", 
          title: "text-md sm:text-lg font-medium mb-1",
          details: "text-xs sm:text-sm gap-1",
          priceTag: "bottom-2 right-2 sm:bottom-3 sm:right-3",
        };
      case 'featured':
        return {
          card: "rounded-2xl hover:scale-[1.03] shadow-md",
          content: "p-3 sm:p-4 md:p-5",
          title: "text-lg sm:text-xl md:text-2xl font-semibold mb-2",
          details: "text-sm gap-2",
          priceTag: "bottom-4 right-4",
        };
      case 'compact':
        return {
          card: "rounded-lg hover:scale-[1.01]",
          content: "p-1 sm:p-2",
          title: "text-sm sm:text-md font-medium mb-0.5",
          details: "text-xs gap-1",
          priceTag: "bottom-1 right-1 sm:bottom-2 sm:right-2 text-xs",
        };
      default:
        return {
          card: "rounded-md sm:rounded-lg md:rounded-xl hover:scale-[1.02]",
          content: "p-2 sm:p-2 md:p-3",
          title: "text-md sm:text-lg md:text-xl font-medium mb-1",
          details: "text-xs sm:text-sm gap-1 sm:gap-2",
          priceTag: "bottom-3 right-3 sm:bottom-4 sm:right-4",
        };
    }
  };

  const styles = getVariantClasses();

  return (
    <Link href={`/boats/${boat.id}`} className="block">
      <Card 
        className={cn(
          "group relative overflow-hidden font-poppins bg-white flex flex-col h-full transition-all duration-500 cursor-pointer",
          styles.card,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <AspectRatio ratio={aspectRatio} className="overflow-hidden">
            {hasImages ? (
              (() => {
                const props = getImageKitProps(currentImageUrl!, 'card', { eager: index < 3 || !!imagePriority });
                return (
                  <IKImage
                    src={props.src}
                    alt={boat.displayTitle || boat.name}
                    width={props.width}
                    height={props.height}
                    sizes={props.sizes}
                    className="object-cover w-full h-full"
                    style={{ position: "absolute", inset: 0 }}
                    loading={props.loading}
                    fetchPriority={props.fetchPriority}
                    transformation={props.transformation}
                  />
                );
              })()
            ) : (
              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-16 h-16 mb-4">
                  <Image
                    src="/icons/updatekoslogo-branded.png"
                    alt="KOS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-gray-600 font-medium mb-1">No Images Available</p>
                <p className="text-sm text-gray-500">Images for this boat are coming soon</p>
              </div>
            )}
            
            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/70 backdrop-blur-xs rounded-full shadow-md transition-all duration-200 hover:scale-110"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4",
                  isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"
                )}
              />
            </button>
            
            {/* Navigation arrows - only show on hover */}
            {isHovered && images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageNavigation('prev');
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageNavigation('next');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>
              </>
            )}
            
            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-10">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
            
            {/* Price tag */}
            {showPrice && (
              <div className={cn(
                "absolute bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg shadow-md",
                styles.priceTag
              )}>
                <span className="text-sm sm:text-base font-medium text-[#1E293B]">{getBoatStartingHourlyLabel(boat)}</span>
              </div>
            )}
            
            {/* Featured tag - Corner flag */}
            {boat.featured && highlightFeatured && (
              <div className="absolute top-0 left-0 z-20">
                <div className="bg-linear-to-r from-emerald-400 to-emerald-500 text-white px-2 py-1 font-medium text-xs uppercase tracking-wide shadow-lg rounded-br-lg">
                  Featured
                </div>
              </div>
            )}
          </AspectRatio>
        </CardHeader>

        {/* Card content */}
        {showDetails && (
          <CardContent className={cn(
            "flex-1 flex flex-col",
            styles.content
          )}>
            <div className="flex items-start justify-between gap-3 sm:gap-6">
              <div className="flex-1 min-w-0 overflow-hidden">
                {/* Boat title */}
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "text-[#1E293B] group-hover:text-primary transition-colors truncate",
                    styles.title
                  )}>
                    {boat.displayTitle || boat.name}
                  </h3>
                  {/* Display InstantBook icon if available */}
                  {showInstantBook && boat.instantBook && (
                    <Image 
                      src="/icons/instant-book-small.svg" 
                      width={12} 
                      height={12} 
                      alt="Instant Book" 
                      className="h-3 w-3" 
                    />
                  )}
                </div>
                
                {/* Location */}
                {showLocation && boat.locationLabel && boat.locationLabel !== 'N/A' && (
                  <div className={cn(
                    "flex items-center mb-1 sm:mb-2 w-full overflow-hidden text-gray-600",
                    styles.details
                  )}>
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="font-light tracking-wide truncate overflow-hidden">{boat.locationLabel}</span>
                  </div>
                )}
                
                {/* Guest capacity */}
                <div className={cn(
                  "flex items-center text-gray-600",
                  styles.details
                )}>
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-light tracking-wide">{boat.capacity || boat.numOfPassengers} Guests</span>
                </div>
              </div>
              
              {/* Rating */}
              {showRating && (
                <div className="text-[#1E293B] flex items-center">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-emerald-500 text-emerald-500 inline-block mr-1" />
                  <span className="text-xs sm:text-sm font-medium">
                    {boat.averageRating?.toFixed(1) || "--"} 
                    <span className="text-gray-500 font-normal ml-0.5">
                      ({boat.totalReviews} {boat.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default BoatCard; 