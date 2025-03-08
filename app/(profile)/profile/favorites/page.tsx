import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, MapPin, Ship, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  // Fetch user data from database to get complete profile
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const user = userData[0] || null;

  // Empty favorites array
  const favorites = [];

  return (
    <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6 animate-fadeIn">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-lg p-4 md:p-6 text-white shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Favorites</h1>
            <p className="mt-1 text-white/90 text-sm md:text-base">Your saved boats ({favorites.length})</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            asChild
          >
            <Link href="/boats">
              Browse <span className="hidden sm:inline">Boats</span> <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Boat cards would be rendered here */}
        </div>
      ) : (
        <Card className="border-dashed border-gray-200 bg-white">
          <CardContent className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-base font-medium text-gray-900">No favorites yet</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">
              You haven't saved any boats to your favorites yet. Browse boats and click the heart icon to save them here.
            </p>
            <Button className="bg-primary text-white" size="sm" asChild>
              <Link href="/boats">
                Browse Boats
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface BoatCardProps {
  boat: {
    id: number;
    name: string;
    type: string;
    length: string;
    capacity: number;
    location: string;
    pricePerHour: number;
    rating: number;
    reviewCount: number;
    image: string;
    captain: boolean;
  };
}

const BoatCard = ({ boat }: BoatCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="relative">
        <img 
          src={boat.image} 
          alt={boat.name} 
          className="w-full h-48 object-cover"
        />
        <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-50 transition-all">
          <Heart className="h-5 w-5 text-primary fill-primary" />
        </button>
        {boat.captain && (
          <div className="absolute bottom-3 left-3 bg-gold/20 text-gold text-xs px-2 py-1 rounded-full font-medium">
            Captain Included
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900">{boat.name}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <Ship className="h-3.5 w-3.5 text-primary" />
              {boat.type} • {boat.length}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">${boat.pricePerHour}</p>
            <p className="text-gray-500 text-xs">per hour</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4 text-primary" />
            {boat.location}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="h-4 w-4 text-primary" />
            Up to {boat.capacity} guests
          </div>
          <div className="flex items-center gap-1 text-sm">
            <div className="flex items-center">
              <span className="text-gold">★</span>
              <span className="font-medium ml-1">{boat.rating}</span>
            </div>
            <span className="text-gray-500">({boat.reviewCount} reviews)</span>
          </div>
        </div>
        
        <div className="mt-auto flex gap-2">
          <Button variant="outline" className="flex-1 text-xs sm:text-sm" asChild>
            <Link href={`/boats/${boat.id}`}>
              View Details
            </Link>
          </Button>
          <Button className="flex-1 bg-primary text-white text-xs sm:text-sm" asChild>
            <Link href={`/boats/${boat.id}/book`}>
              Book Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 