import { Button } from "@/shared/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FavoritesPage() {
  // Note: No auth check needed as it's handled by the protected layout
  // In the future, you would fetch favorites from the database here
  const favorites: any[] = [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          My favorites
        </h1>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Boat cards would be rendered here */}
        </div>
      ) : (
        <div className="md:bg-white md:rounded-3xl md:p-12 md:shadow-sm md:border md:border-gray-200">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Image */}
            <div className="flex-shrink-0 w-full md:w-64 max-w-xs">
              <div className="relative md:left-1/3 aspect-square rounded-2xl overflow-hidden bg-white">
                <Image
                  src="/images/boats/catamaran2.jpg"
                  alt="Beautiful yacht on the water"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 256px"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center px-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-6 w-6 md:h-7 md:w-7 text-red font-bold" />
                <h2 className="text-xl md:text-2xl font-bold">
                  No favorites yet
                </h2>
              </div>
              <p className="max-w-lg mx-auto text-sm md:text-base text-muted-foreground mb-4">
                Start building your collection of favorite boats. Browse our
                selection and click the heart icon to save boats you love for
                easy access later.
              </p>
              <Button
                className="bg-primary text-white hover:bg-primary/90 rounded-lg w-full md:w-auto"
                asChild
              >
                <Link href="/boats/search">Browse boats</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
