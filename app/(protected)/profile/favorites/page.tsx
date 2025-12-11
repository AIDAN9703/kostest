import { Button } from "@/shared/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  // Note: No auth check needed as it's handled by the protected layout
  // In the future, you would fetch favorites from the database here
  const favorites: any[] = [];

  return (
    <div className="space-y-6">
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Boat cards would be rendered here */}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-medium text-gray-900">No favorites yet</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">
            You haven't saved any boats to your favorites yet. Browse boats and click the heart icon to save them here.
          </p>
          <Button className="bg-primary text-white" size="sm" asChild>
            <Link href="/boats">Browse Boats</Link>
          </Button>
        </div>
      )}
    </div>
  );
} 