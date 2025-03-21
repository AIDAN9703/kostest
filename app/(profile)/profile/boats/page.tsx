import { auth } from "@/auth";
import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Ship, Calendar, DollarSign, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

// Loading skeleton component
const BoatsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyBoatsState = () => (
  <Card className="border-dashed border-gray-300 bg-gray-50">
    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Ship className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No boats listed yet</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        Start listing your boats to rent them out to other users.
      </p>
      <Button className="bg-primary text-white" asChild>
        <Link href="/profile/boats/new">
          <Plus className="h-4 w-4 mr-2" />
          List a Boat
        </Link>
      </Button>
    </CardContent>
  </Card>
);

// Boat card component
const BoatCard = ({ boat }: { boat: any }) => (
  <Card className="overflow-hidden h-full flex flex-col">
    <div className="relative h-48">
      {boat.mainImage ? (
        <Image
          src={boat.mainImage}
          alt={boat.name}
          className="w-full h-full object-cover"
          width={400}
          height={300}
          priority={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <Ship className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/profile/boats/${boat.id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
    
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{boat.name}</CardTitle>
      <CardDescription>
        {boat.location?.city}, {boat.location?.state}
      </CardDescription>
    </CardHeader>
    
    <CardContent className="pb-2 flex-grow">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span>{boat.bookings || 0} bookings</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
          <span>${boat.pricePerDay}/day</span>
        </div>
      </div>
    </CardContent>
    
    <CardFooter className="pt-2 flex justify-between border-t">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/boats/${boat.id}`}>
          <Eye className="h-4 w-4 mr-2" />
          View Listing
        </Link>
      </Button>
      <Button variant="destructive" size="sm">
        <Trash2 className="h-4 w-4 mr-2" />
        Remove
      </Button>
    </CardFooter>
  </Card>
);

// Main content component
const MyBoatsContent = async () => {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }
  
  // Fetch user's boats from database
  const userBoats = await db
    .select()
    .from(boats)
    .where(eq(boats.ownerId, session.user.id));
  
  return (
    <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Boats</h1>
        <Button className="bg-primary text-white" asChild>
          <Link href="/profile/boats/new">
            <Plus className="h-4 w-4 mr-2" />
            List a Boat
          </Link>
        </Button>
      </div>
      
      {userBoats.length === 0 ? (
        <EmptyBoatsState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBoats.map((boat) => (
            <BoatCard key={boat.id} boat={boat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function MyBoatsPage() {
  return (
    <Suspense fallback={<BoatsSkeleton />}>
      <MyBoatsContent />
    </Suspense>
  );
} 