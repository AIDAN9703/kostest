'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/shared/components/ui/carousel";

// Keep client images outside component to prevent recreation
const clientImages = [
  {
    url: '/clients/beachday.jpeg',
    title: 'Beach Day',
  },
  {
    url: '/clients/bernie.JPG',
    title: 'Deep Sea Adventure',
  },
  {
    url: '/clients/niceyacht.jpg',
    title: 'Luxury Yacht Experience',
  },
  {
    url: '/clients/girls.jpg',
    title: 'Friends Celebration',
  },
  {
    url: '/clients/backflip.JPG',
    title: 'Backflip',
  },
  {
    url: '/clients/bunchofgirls.JPG',
    title: 'Bunch of Girls',
  },
  {
    url: '/clients/jetski.jpeg',
    title: 'Jetski',
  },
  {
    url: '/clients/king.JPG',
    title: 'Ocean Royalty',
  },
  {
    url: '/clients/hannah.JPG',
    title: 'Sunset Adventure',
  },
  {
    url: '/clients/koshat.jpeg',
    title: 'Paradise Found',
  },
  {
    url: '/clients/fishing.jpeg',
    title: 'Fishing',
  },
];

// Group images into sets of 4 for the grid
type ImageGroup = typeof clientImages[0][];
const imageGroups: ImageGroup[] = [];
for (let i = 0; i < clientImages.length; i += 4) {
  const group = clientImages.slice(i, i + 4);
  // Make sure we have exactly 4 images in each group
  while (group.length < 4) {
    // If we don't have enough, repeat from the beginning
    group.push(clientImages[group.length % clientImages.length]);
  }
  imageGroups.push(group);
}

export default function ClientsShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update current index when carousel changes
  const onSelect = useCallback(() => {
    if (api) {
      setCurrentIndex(api.selectedScrollSnap());
    }
  }, [api]);

  // Set up API event listeners
  useEffect(() => {
    if (!api) return;
    
    onSelect();
    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Navigation handlers
  const prevSlide = useCallback(() => {
    if (api) api.scrollPrev();
  }, [api]);

  const nextSlide = useCallback(() => {
    if (api) api.scrollNext();
  }, [api]);

  // Create an image grid component for each group of 4 images
  const ImageGrid = ({ images }: { images: ImageGroup }) => (
    <div className="grid grid-cols-12 gap-3">
      {/* Top Row */}
      <div className="col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden">
        <Image
          src={images[0].url}
          alt={images[0].title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 90vw, 58vw"
          quality={80}
        />
      </div>
      <div className="col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden mt-[13%]">
        <Image
          src={images[1].url}
          alt={images[1].title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 40vw, 30vw"
          quality={80}
        />
      </div>

      {/* Bottom Row */}
      <div className="col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden">
        <Image
          src={images[2].url}
          alt={images[2].title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 40vw, 30vw"
          quality={80}
        />
      </div>
      <div className="col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden">
        <Image
          src={images[3].url}
          alt={images[3].title}
          sizes="(max-width: 768px) 90vw, 58vw"
          fill
          className="object-cover"
          quality={80}
        />
      </div>
    </div>
  );

  return (
    <section className="py-6 sm:py-12 relative overflow-hidden">
      <div className="max-w-full sm:max-w-[80%] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
          {/* Title and Navigation */}
          <div className="md:col-span-3 z-10">
            <div className="flex md:block items-center justify-between">
              <h2 className="sm:mt-20 font-poppins font-medium text-3xl sm:text-4xl md:text-5xl text-primary leading-tight max-w-md">
                Discover your next on-the-water adventure
              </h2>
              
              <div className="flex items-center gap-2 md:mt-8">
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
                  aria-label="Previous experience images"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </motion.button>
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-200"
                  aria-label="Next experience images"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </motion.button>
              </div>
            </div>
            
            {/* Pagination indicators */}
            <div className="hidden md:flex mt-6 justify-start gap-1.5">
              {imageGroups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentIndex === i ? 'bg-primary w-4' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={currentIndex === i ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>
          
          {/* Carousel */}
          <div className="md:col-span-9">
            <Carousel 
              setApi={setApi}
              opts={{
                align: "center" as const,
                loop: true,
              }}
              className="w-full"
              aria-label="Client experience showcases"
            >
              <CarouselContent>
                {imageGroups.map((group, index) => (
                  <CarouselItem key={index}>
                    <ImageGrid images={group} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
} 