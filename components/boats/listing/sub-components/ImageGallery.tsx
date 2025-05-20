import { Image as IKImage } from "@imagekit/next";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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

  // Check if a URL already has transformations
  const hasTransformations = (src: string) => src.includes('tr=');

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {allImages.map((src, index) => (
          <CarouselItem key={index} className="md:basis-[60%] basis-full">
            <AspectRatio ratio={16/9} className="bg-gray-100 sm:rounded-xl">
              {hasTransformations(src) ? (
                // For URLs with existing transformations, use a regular img tag
                <img
                  src={src}
                  alt={`${alt} - Image ${index + 1}`}
                  className="object-cover w-full h-full sm:rounded-xl"
                />
              ) : (
                // For other images, use the ImageKit component with transformations
                <IKImage
                  src={src}
                  alt={`${alt} - Image ${index + 1}`}
                  width={1600}
                  height={900}
                  className="object-cover w-full h-full sm:rounded-xl"
                  loading={index === 0 ? "eager" : "lazy"}
                  style={{ position: "absolute", inset: 0 }}
                  transformation={[
                    { 
                      width: 1600,
                      height: 900,
                      quality: 90,
                      format: "auto"
                    }
                  ]}
                />
              )}
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      {allImages.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-6 h-6 md:w-10 md:h-10 bg-white/70 hover:bg-white/90 transition-colors" />
          <CarouselNext className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-6 h-6 md:w-10 md:h-10 bg-white/70 hover:bg-white/90 transition-colors" />
        </>
      )}
    </Carousel>
  );
} 