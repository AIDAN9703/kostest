"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as IKImage } from "@imagekit/next";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import ImageGalleryViewAll from "./ImageGalleryViewAll";

interface ImageGalleryProps {
  mainImage: string;
  galleryImages: string[];
  alt: string;
}

export function ImageGallery({ mainImage, galleryImages = [], alt }: ImageGalleryProps) {
  const allImages = [
    mainImage,
    ...(galleryImages || [])
  ].filter(Boolean) as string[];
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();

  // Navigation handlers
  const prevSlide = () => {
    if (api) api.scrollPrev();
  };

  const nextSlide = () => {
    if (api) api.scrollNext();
  };

  // Open zoom modal with specific image
  const openZoom = (index: number) => {
    setCurrentIndex(index);
    setZoomOpen(true);
  };
  
  // Navigate through images in zoom view
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };
  
  // Close zoom modal
  const closeZoom = () => {
    setZoomOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'Escape') {
      closeZoom();
    }
  };
  
  // Handle click on main image or gallery image
  const handleImageClick = (index: number) => {
    openZoom(index);
  };

  // Check if a URL already has transformations
  const hasTransformations = (src: string) => src.includes('tr=');
  
  // Handle opening the view all gallery
  const openViewAll = (index: number = 0) => {
    setCurrentIndex(index);
    setViewAllOpen(true);
  };

  if (allImages.length === 0) {
    return (
      <div className="bg-gray-100 rounded-none sm:rounded-xl overflow-hidden w-full aspect-video sm:aspect-[3/1.75] md:aspect-[3/1.5] lg:aspect-[3/1.25]">
        <div className="h-full flex items-center justify-center text-gray-400">
          No images available
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {allImages.map((image, idx) => (
              <CarouselItem
                key={idx} 
                className="md:basis-[60%] basis-full"
                onClick={() => handleImageClick(idx)}
              >
                <AspectRatio 
                  ratio={16 / 9}
                  className="bg-slate-50 rounded-none sm:rounded-lg overflow-hidden group"
                >
                  <IKImage
                    src={image}
                    alt={`${alt} ${idx + 1}`}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                    width={1200}
                    height={800}
                    transformation={hasTransformations(image) ? [] : [{ quality: 50 }]}
                  />
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Custom navigation buttons */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous</span>
          </Button>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
        
        {/* View all photos button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-sm"
          onClick={() => openViewAll(0)}
        >
          View All Photos
        </Button>
      </div>
      
      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col relative"
            >
              {/* Close button */}
              <button 
                onClick={closeZoom}
                className="absolute top-4 right-4 z-10 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Navigation */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={prevImage}
                  className="text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={nextImage}
                  className="text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              
              {/* Image counter */}
              <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1.5 rounded-full text-sm">
                {currentIndex + 1} / {allImages.length}
              </div>
              
              {/* Main image */}
              <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <div className="relative w-full max-w-6xl max-h-full aspect-auto">
                    <Image
                      src={allImages[currentIndex]}
                      alt={`${alt} ${currentIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      quality={90}
                    />
                  </div>
                </motion.div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex justify-center pb-4 px-4 overflow-x-auto">
                <div className="flex gap-2 max-w-full">
                  {allImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-16 h-16 rounded-md overflow-hidden cursor-pointer ${index === currentIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* View All Gallery Popup */}
      <ImageGalleryViewAll
        images={allImages}
        alt={alt}
        isOpen={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        initialIndex={currentIndex}
      />
    </>
  );
} 