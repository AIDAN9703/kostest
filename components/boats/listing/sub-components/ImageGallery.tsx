import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getOptimizedImageUrl } from "@/lib/services/imagekit";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageGalleryProps {
  mainImage?: string | null;
  galleryImages?: string[] | null;
  alt: string;
}

export function ImageGallery({ mainImage, galleryImages, alt }: ImageGalleryProps) {
  const allImages = [
    mainImage,
    ...(galleryImages || [])
  ].filter(Boolean) as string[];

  if (allImages.length === 0) {
    return (
      <div className="w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 font-medium">No images available</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {allImages.map((image, index) => (
          <CarouselItem key={index} className="md:basis-[60%] basis-full">
            <AspectRatio ratio={16/9} className="bg-gray-100 sm:rounded-xl">
              <Image
                src={getOptimizedImageUrl(image, {
                  width: 1200,
                  height: 200,
                  format: 'auto',
                  quality: 80
                })}
                alt={`${alt} - Image ${index + 1}`}
                fill
                className="object-cover sm:rounded-xl"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 800px"
              />
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      {allImages.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-6 h-6 md:w-10 md:h-10 bg-white/70 hover:bg-white/90 transition-colors" />
          <CarouselNext className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-6 h-6 md:w-10 md:h-10  bg-white/70 hover:bg-white/90 transition-colors" />
        </>
      )}
    </Carousel>
  );
} 