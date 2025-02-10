import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID;

    if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
      console.error('Missing environment variables:', {
        hasApiKey: !!GOOGLE_PLACES_API_KEY,
        hasPlaceId: !!PLACE_ID
      });
      throw new Error('Missing required environment variables');
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,name&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log('Fetching from Places API...');
    const response = await fetch(url);
    const data = await response.json();

    console.log('Places API Response:', {
      status: data.status,
      hasResult: !!data.result,
      hasReviews: !!(data.result?.reviews),
      errorMessage: data.error_message
    });

    if (!response.ok || data.status === 'ERROR' || data.status === 'INVALID_REQUEST') {
      throw new Error(data.error_message || 'Failed to fetch reviews');
    }

    if (!data.result?.reviews) {
      return NextResponse.json({
        reviews: [],
        message: 'No reviews found for this place ID'
      });
    }

    return NextResponse.json({
      reviews: data.result.reviews,
      businessName: data.result.name
    });
  } catch (error) {
    console.error('Error in /api/reviews:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch reviews',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 