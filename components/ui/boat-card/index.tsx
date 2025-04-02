'use client';

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boat } from "@/types/types";
import { Users, MapPin, Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getOptimizedImageUrl } from "@/lib/services/imagekit";
import { cn } from "@/lib/utils";

interface BoatCardProps {
  boat: Boat;
  index?: number;
  variant?: 'default' | 'search' | 'featured' | 'compact';
  showRating?: boolean;
  showDetails?: boolean;
  showPrice?: boolean;
  showLocation?: boolean;
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
    '/images/boats/yacht1.jpg' // fallback
  ].filter(Boolean);

  // Process the current image URL with our ImageKit optimization
  const currentImageUrl = getOptimizedImageUrl(
    images[currentImageIndex] || '/images/boats/yacht1.jpg',
    {
      width: 622,
      height: 350,
      format: 'auto',
      quality: 80
    }
  );

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

  // ====== VARIANT-SPECIFIC STYLING ======
  // Easily modify styles for each variant here
  const variantStyles = useMemo(() => {
    // Default styles
    const defaultStyles = {
      card: "rounded-md sm:rounded-lg md:rounded-xl hover:scale-[1.02]",
      content: "p-2 sm:p-2 md:p-3",
      title: "text-md sm:text-lg md:text-xl font-medium mb-1",
      location: "flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2",
      guests: "flex items-center gap-1 sm:gap-2",
      rating: "flex items-center",
      priceTag: "bottom-3 right-3 sm:bottom-4 sm:right-4",
      featuredTag: "top-3 left-3 sm:top-4 sm:left-4"
    };

    // Variant-specific style overrides
    switch (variant) {
      case 'search':
        return {
          card: "rounded-xl hover:scale-[1.01]",
          content: "p-2 sm:p-3", // Reduced padding for search variant
          title: "text-md sm:text-lg font-medium mb-1",
          location: "flex items-center gap-1 mb-1",
          guests: "flex items-center gap-1",
          rating: "flex items-center",
          priceTag: "bottom-2 right-2 sm:bottom-3 sm:right-3",
          featuredTag: "top-2 left-2 sm:top-3 sm:left-3"
        };
      case 'featured':
        return {
          card: "rounded-2xl hover:scale-[1.03] shadow-md",
          content: "p-3 sm:p-4 md:p-5", // More padding for featured variant
          title: "text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3",
          location: "flex items-center gap-2 mb-2",
          guests: "flex items-center gap-2",
          rating: "flex items-center",
          priceTag: "bottom-4 right-4",
          featuredTag: "top-4 left-4"
        };
      case 'compact':
        return {
          card: "rounded-lg hover:scale-[1.01]",
          content: "p-1 sm:p-2", // Minimal padding for compact variant
          title: "text-sm sm:text-md font-medium mb-0.5",
          location: "flex items-center gap-1 mb-0.5 text-xs",
          guests: "flex items-center gap-1 text-xs",
          rating: "flex items-center",
          priceTag: "bottom-1 right-1 sm:bottom-2 sm:right-2 text-xs",
          featuredTag: "top-1 left-1 sm:top-2 sm:left-2 text-xs"
        };
      default:
        return defaultStyles;
    }
  }, [variant]);

  return (
    <Link href={`/boats/${boat.id}`} className="block">
      <Card 
        className={cn(
          "group relative overflow-hidden bg-white flex flex-col h-full transition-all duration-500 cursor-pointer",
          variantStyles.card,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <AspectRatio ratio={aspectRatio} className="overflow-hidden">
            <Image
              src={currentImageUrl}
              alt={boat.displayTitle || boat.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={imagePriority ?? (index < 3)}
            />
            
            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/70 backdrop-blur-sm rounded-full shadow-md transition-all duration-200 hover:scale-110"
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
                "absolute bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md",
                variantStyles.priceTag
              )}>
                <span className="text-sm sm:text-base font-medium text-[#1E293B]">
                  {formatCurrency(boat.hourlyRate)}+<span className="text-xs sm:text-sm text-gray-500">/hour</span>
                </span>
              </div>
            )}
            
            {/* Featured tag */}
            {boat.featured && highlightFeatured && (
              <div className={cn(
                "absolute bg-emerald-400 px-1 rounded-lg shadow-md",
                variantStyles.featuredTag
              )}>
                <span className="text-xs sm:text-sm font-medium text-white">
                  Featured
                </span>
              </div>
            )}
          </AspectRatio>
        </CardHeader>

        {/* Card content */}
        {showDetails && (
          <CardContent className={cn(
            "flex-1 flex flex-col",
            variantStyles.content
          )}>
            <div className="flex items-start justify-between gap-3 sm:gap-6">
              <div className="flex-1 min-w-0">
                {/* Boat title */}
                <h3 className={cn(
                  "text-[#1E293B] group-hover:text-primary transition-colors truncate",
                  variantStyles.title
                )}>
                  {boat.displayTitle || boat.name}
                </h3>
                
                {/* Location */}
                {showLocation && boat.homePort && boat.homePort !== 'N/A' && (
                  <div className={cn(
                    "text-gray-600",
                    variantStyles.location
                  )}>
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-light tracking-wide">{boat.homePort}</span>
                  </div>
                )}
                
                {/* Guest capacity */}
                <div className={cn(
                  "text-gray-600",
                  variantStyles.guests
                )}>
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-light tracking-wide">{boat.capacity || boat.numOfPassengers} Guests</span>
                </div>
              </div>
              
              {/* Rating */}
              {showRating && (
                <div className={cn(
                  "text-[#1E293B] flex items-center",
                  variantStyles.rating
                )}>
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-300 text-yellow-300 inline-block mr-1" />
                  <span className="text-xs sm:text-sm font-medium">
                    {boat.averageRating ? Number(boat.averageRating).toFixed(1) : '4.9'} 
                    <span className="text-gray-500 font-normal ml-0.5">
                      ({boat.totalReviews || 12} reviews)
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