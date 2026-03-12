"use client";

import { useState } from "react";
import { Boat } from "@/shared/lib/types/types";
import { Button } from "@/shared/components/ui/button";
import { Star, ThumbsUp, Loader2 } from "lucide-react";
import {
  getBoatReviews,
  ReviewWithUser,
} from "@/features/reviews/actions/reviews";
import { format } from "date-fns";

interface ReviewsProps {
  boat: Boat;
}

export function Reviews({ boat }: ReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const hasReviews = boat.totalReviews && boat.totalReviews > 0;

  const handleLoadReviews = async () => {
    if (reviewsLoaded) return;

    try {
      setIsLoading(true);
      const reviewData = await getBoatReviews(boat.id, 10);
      setReviews(reviewData);
      setReviewsLoaded(true);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Star Rating */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
        <div className="flex items-center gap-1.5">
          <Star
            className={`w-5 h-5 ${hasReviews ? "fill-emerald-400 text-emerald-400" : "fill-gray-300 text-gray-300"}`}
          />
          <span className="font-medium">
            {boat.averageRating ? Number(boat.averageRating).toFixed(1) : "--"}
          </span>
          <span className="text-gray-500">
            ({boat.totalReviews || 0}{" "}
            {boat.totalReviews === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {hasReviews ? (
        <>
          {/* Review metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MetricCard title="Listing Accuracy" rating="Excellent" />
            <MetricCard title="Communication" rating="Excellent" />
            <MetricCard title="Experience" rating="Excellent" />
          </div>

          {!reviewsLoaded ? (
            /* Load reviews placeholder */
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-gray-600 mb-2">Reviews available</div>
              <p className="text-sm text-gray-500 mb-4">
                This boat has {boat.totalReviews} review
                {boat.totalReviews === 1 ? "" : "s"} with an average rating of{" "}
                {boat.averageRating
                  ? Number(boat.averageRating).toFixed(1)
                  : "--"}{" "}
                stars.
              </p>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
                onClick={handleLoadReviews}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Reviews...
                  </>
                ) : (
                  "Load Reviews"
                )}
              </Button>
            </div>
          ) : (
            /* Actual reviews list */
            <div className="space-y-8">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-8 last:border-0"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-700 font-medium">
                        {getReviewerInitial(review)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {getReviewerDisplayName(review)}
                          </p>
                          {review.isVerified && (
                            <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              Verified
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-emerald-400 text-emerald-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm">
                            {format(new Date(review.createdAt), "MMMM yyyy")}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 mb-2">
                            {review.title}
                          </h4>
                        )}
                        {review.content && (
                          <p className="text-gray-700 leading-relaxed">
                            {review.content}
                          </p>
                        )}
                        {review.helpfulCount && review.helpfulCount > 0 && (
                          <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                            <ThumbsUp className="w-3 h-3" />
                            <span>
                              {review.helpfulCount} found this helpful
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No reviews found for this boat.
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // No reviews state
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No reviews yet</div>
          <p className="text-sm text-gray-400">
            Be the first to leave a review for this boat!
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getReviewerInitial(review: ReviewWithUser): string {
  if (review.reviewerFirstName) {
    return review.reviewerFirstName.charAt(0).toUpperCase();
  }
  if (review.reviewerName) {
    return review.reviewerName.charAt(0).toUpperCase();
  }
  return "A"; // Anonymous fallback
}

function getReviewerDisplayName(review: ReviewWithUser): string {
  if (review.reviewerName) {
    return review.reviewerName;
  }
  if (review.reviewerFirstName) {
    return review.reviewerFirstName;
  }
  return "Anonymous"; // Fallback
}

// Helper component for review metrics
function MetricCard({ title, rating }: { title: string; rating: string }) {
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
