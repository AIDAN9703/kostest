import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Anchor, MapPin, Ship } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-500 mt-1">Your saved boats ({favorites.length})</p>
        </div>
        <Button variant="outline" size="sm" className="border-amber-200 text-amber-800 hover:bg-amber-50">
          Browse More Boats
        </Button>
      </div>
      
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Boat cards would be rendered here */}
        </div>
      ) : (
        <EmptyState 
          icon={Heart}
          title="No favorites yet"
          description="You haven't saved any boats to your favorites yet. Browse boats and click the heart icon to save them here."
          actionLabel="Browse Boats"
          actionHref="/boats"
          iconClassName="bg-primary/10 text-primary"
        />
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
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img 
          src={boat.image} 
          alt={boat.name} 
          className="w-full h-48 object-cover"
        />
        <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-md">
          <Heart className="h-5 w-5 text-primary fill-primary" />
        </button>
        {boat.captain && (
          <div className="absolute bottom-3 left-3 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
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
              <span className="text-amber-500">★</span>
              <span className="font-medium ml-1">{boat.rating}</span>
            </div>
            <span className="text-gray-500">({boat.reviewCount} reviews)</span>
          </div>
        </div>
        
        <div className="mt-auto flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/boats/${boat.id}`}>
              View Details
            </Link>
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" asChild>
            <Link href={`/boats/${boat.id}/book`}>
              Book Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 