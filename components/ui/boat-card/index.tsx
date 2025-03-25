'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boat } from "@/types/types";
import { Users, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getOptimizedImageUrl } from "@/lib/services/imagekit";

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

  return (
    <Link href={`/boats/${boat.id}`} className="block">
      <Card 
        className={`group relative overflow-hidden bg-white flex flex-col h-full rounded-md sm:rounded-lg md:rounded-xl transition-all duration-500 cursor-pointer hover:scale-[1.02] ${className}`}
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
            
            {showPrice && (
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
                <span className="text-sm sm:text-base font-medium text-[#1E293B]">
                  {formatCurrency(boat.hourlyRate)}+<span className="text-xs sm:text-sm text-gray-500">/hour</span>
                </span>
              </div>
            )}
            
            {boat.featured && highlightFeatured && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-emerald-400 px-1 rounded-lg shadow-md">
                <span className="text-xs sm:text-sm font-medium text-white">
                  Featured
                </span>
              </div>
            )}
          </AspectRatio>
        </CardHeader>

        {showDetails && (
          <CardContent className="p-2 sm:p-2 md:p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-3 sm:gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-md sm:text-lg md:text-xl font-medium text-[#1E293B] group-hover:text-primary transition-colors mb-1 sm:mb-2 truncate">
                  {boat.displayTitle || boat.name}
                </h3>
                
                {showLocation && boat.homePort && boat.homePort !== 'N/A' && (
                  <div className="flex items-center gap-1 sm:gap-2 text-gray-600 mb-1 sm:mb-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-light tracking-wide">{boat.homePort}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-light tracking-wide">{boat.capacity || boat.numOfPassengers} Guests</span>
                </div>
              </div>
              
              {showRating && (
                <div className="flex items-center gap-1 sm:gap-2 text-[#1E293B]">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300 text-yellow-300" />
                  <span className="text-sm sm:text-base font-medium">4.9</span>
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