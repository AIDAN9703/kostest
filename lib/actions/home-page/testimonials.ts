import { cachedFetch } from '@/lib/utils';
import { ActionResponse } from '@/types/types';

interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url: string;
}

interface PlacesResponse {
  result: {
    reviews: Review[];
  };
}

export async function getTestimonials(): Promise<ActionResponse<Review[]>> {
  "use server";
  
  return cachedFetch<ActionResponse<Review[]>>(
    'testimonials',
    async () => {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      const placeId = process.env.GOOGLE_PLACE_ID;
      
      if (!apiKey || !placeId) {
        return {
          success: false,
          error: 'Missing Google Places API configuration'
        };
      }
      
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`,
          { next: { revalidate: 3600 } }
        );
        
        if (!response.ok) {
          return {
            success: false,
            error: 'Failed to fetch reviews from Google Places API'
          };
        }
        
        const data: PlacesResponse = await response.json();
        return {
          success: true,
          data: data.result?.reviews || []
        };
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        return {
          success: false,
          error: 'Failed to fetch testimonials'
        };
      }
    },
    { revalidate: 3600 }
  );
} 