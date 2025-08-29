"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryViewAllProps {
  images: string[];
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function ImageGalleryViewAll({
  images,
  alt,
  isOpen,
  onClose,
  initialIndex = 0,
}: ImageGalleryViewAllProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 bg-black border-0 rounded-lg">
        <DialogTitle className="sr-only">
          {`Image gallery for ${alt}`}
        </DialogTitle>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
          aria-label="Close gallery"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main image area */}
        <div className="h-[calc(100%-100px)] w-full flex items-center justify-center">
          <img 
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain mx-auto px-8"
            loading="lazy"
          />
        </div>
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
              onClick={goToPrev}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Image counter */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[110px] bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-xs">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Thumbnail strip */}
        <div className="absolute bottom-0 left-0 w-full h-[100px] p-4 bg-black border-t border-gray-800">
          <div className="flex gap-2 overflow-x-auto pb-2 mx-auto justify-center h-full">
            {images.map((src, index) => (
              <button 
                key={index}
                className={`h-full aspect-video shrink-0 rounded-md overflow-hidden transition-opacity duration-200 focus:outline-hidden ${
                  currentIndex === index 
                    ? 'ring-2 ring-white opacity-100' 
                    : 'opacity-60 hover:opacity-90'
                }`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={currentIndex === index}
              >
                <img 
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover h-full w-full"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 