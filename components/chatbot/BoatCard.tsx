import { MapPin, Users, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface BoatCardProps {
  boat: {
    id: string;
    name: string;
    displayTitle?: string;
    category: string;
    capacity: number;
    lengthFt?: number;
    locationLabel: string;
    averageRating?: number;
    totalReviews?: number;
    instantBook?: boolean;
    mainImage?: string;
    description?: string;
    minPrice?: number;
  };
}

export default function BoatCard({ boat }: BoatCardProps) {
  const imageUrl = boat.mainImage || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80';

  const formatPrice = () => {
    if (boat.minPrice && boat.minPrice > 0) {
      return `$${boat.minPrice.toLocaleString()}`;
    }
    return null;
  };

  const priceDisplay = formatPrice();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 w-full">
      <div className="flex">
        {/* Image Section */}
        <div className="relative h-24 w-32 flex-shrink-0">
          <Image
            src={imageUrl}
            alt={boat.name}
            fill
            className="object-cover"
            sizes="128px"
          />
          {boat.instantBook && (
            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
              Instant
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-sm mb-1 line-clamp-1">
              {boat.displayTitle || boat.name}
            </h4>
            
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-1">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{boat.capacity}</span>
              </div>
              {boat.lengthFt && (
                <span>{boat.lengthFt}ft</span>
              )}
              <span className="capitalize text-gray-500">{boat.category}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{boat.locationLabel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {priceDisplay && (
              <div className="text-sm font-semibold text-primary">
                {priceDisplay} total
              </div>
            )}
            
            <Link href={`/boats/${boat.id}`}>
              <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
