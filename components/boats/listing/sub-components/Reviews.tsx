"use client";

import { Boat } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp } from "lucide-react";

interface ReviewsProps {
  boat: Boat;
}

// Sample review data for demonstration
const sampleReviews = [
  {
    id: '1',
    name: 'Kelly',
    date: 'July 2023',
    rating: 5,
    content: 'We had a wonderful time. Definitely recommend. Captain was the perfect guide. We wanted more of a tour than a party boat and the captain was very informative. They go with the flow depending on what your needs are.'
  },
  {
    id: '2',
    name: 'Chanel',
    date: 'June 2023',
    rating: 5,
    content: 'We had an amazing time! The captain was great, easy going, personable and professional. The boat was very nice and had all of the amenities that you\'ll need. Great value, and we will be returning.'
  }
];

export function Reviews({ boat }: ReviewsProps) {
  // Use boat review data if available or fallback to sample data
  const reviews = sampleReviews;
  
  return (
    <div className="space-y-8">
      {/* Header with Star Rating */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" />
          <span className="font-medium">{boat.averageRating || "5.0"}</span>
          <span className="text-gray-500">
            ({boat.totalReviews || reviews.length} reviews)
          </span>
        </div>
      </div>
      
      {/* Review metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MetricCard 
          title="Listing Accuracy"
          rating="Excellent"
        />
        <MetricCard 
          title="Communication"
          rating="Excellent"
        />
        <MetricCard 
          title="Experience"
          rating="Excellent"
        />
      </div>
      
      {/* Review List */}
      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-8 last:border-0">
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-700 font-medium">
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{review.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-emerald-400 text-emerald-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">{review.date}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.content}</p>
          </div>
        ))}
        
        {reviews.length > 2 && (
          <Button variant="outline" size="lg" className="w-full border-gray-300 hover:bg-gray-50 text-gray-700">
            View All Reviews
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper component for review metrics
function MetricCard({ title, rating }: { title: string, rating: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <ThumbsUp className="h-4 w-4 text-emerald-400" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <p className="text-emerald-400 font-medium">{rating}</p>
    </div>
  );
} 