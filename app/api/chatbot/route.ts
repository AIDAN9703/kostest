import { convertToCoreMessages, streamText, tool } from 'ai';
import { xai } from '@ai-sdk/xai';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { searchBoats } from '@/features/search/actions/search-actions';
import { SearchParamsType, Boat } from '@/shared/types/types';

const apiKey = process.env.XAI_API_KEY;

if (!apiKey) {
  throw new Error('XAI_API_KEY environment variable is required');
}

// Google Places API for location resolution
async function resolveLocation(locationQuery: string) {
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not found');
    return null;
  }

  try {
    // Use the same Google Places API approach as your search components
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationQuery)}&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const bounds = result.geometry.viewport;
      
      return {
        formatted_address: result.formatted_address,
        ne_lat: bounds.northeast.lat,
        ne_lng: bounds.northeast.lng,
        sw_lat: bounds.southwest.lat,
        sw_lng: bounds.southwest.lng
      };
    }
  } catch (error) {
    console.error('Error resolving location:', error);
  }
  
  return null;
}



export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: xai('grok-3'),
      messages: convertToCoreMessages(messages),
      tools: {
        searchBoats: tool({
          description: 'Search for boats using the same system as the main search page',
          parameters: z.object({
            location: z.string().describe('Location name (city, state, or region)'),
            groupSize: z.number().optional().describe('Number of passengers/group size'),
            budget: z.number().optional().describe('Maximum budget in dollars'),
            category: z.string().optional().describe('Boat category (yacht, sportfish, sailboat, etc.)'),
            features: z.array(z.string()).optional().describe('Desired boat features'),
            minLength: z.number().optional().describe('Minimum boat length in feet'),
            maxLength: z.number().optional().describe('Maximum boat length in feet'),
            excludeBoatIds: z.array(z.string()).optional().describe('Boat IDs to exclude from results (for "show me more" functionality)'),
            limit: z.number().optional().describe('Number of boats to return (default 12, max 24)'),
            sortBy: z.enum(['price_asc', 'price_desc', 'length_asc', 'length_desc', 'newest']).optional().describe('How to sort the results'),
            showAll: z.boolean().optional().describe('If true, show all available boats (up to limit)'),
          }),
                      execute: async ({ location, groupSize, budget, category, features, minLength, maxLength, excludeBoatIds, limit = 6, sortBy, showAll }) => {
            try {
              // Resolve location using Google Maps API (same as your search components)
              const locationData = await resolveLocation(location);
              
              if (!locationData) {
                return {
                  error: `I couldn't find "${location}". Could you try a different location or be more specific?`
                };
              }

              // Build search parameters using the same structure as your search page
              const searchParams: SearchParamsType = {
                near: locationData.formatted_address,
                ne_lat: locationData.ne_lat.toString(),
                ne_lng: locationData.ne_lng.toString(),
                sw_lat: locationData.sw_lat.toString(),
                sw_lng: locationData.sw_lng.toString(),
              };

              // Add filters based on user requirements
              if (groupSize) {
                searchParams.passengers = groupSize.toString();
              }
              
              if (budget) {
                searchParams.maxPrice = budget.toString();
              }
              
              if (category) {
                searchParams.category = category.toLowerCase();
              }
              
              if (features && features.length > 0) {
                searchParams.features = features;
              }
              
              if (minLength) {
                searchParams.minLength = minLength.toString();
              }
              
              if (maxLength) {
                searchParams.maxLength = maxLength.toString();
              }

              // Handle boat exclusion for "show more" functionality
              if (excludeBoatIds && excludeBoatIds.length > 0) {
                // Exclude all previously shown boats to avoid duplicates
                // Only exclude if we have a reasonable number to exclude
                if (excludeBoatIds.length < 20) {
                  searchParams.exclude = excludeBoatIds.join(',');
                }
              }

              // Add sorting if specified
              if (sortBy) {
                searchParams.sort = sortBy;
              } else {
                // Default to newest first for variety
                searchParams.sort = 'newest';
              }

                  // Use the same searchBoats function as your search page
    const results = await searchBoats({
                searchParams,
                limit: Math.min(limit, 12), // Cap at 12 for chat interface
                page: 1
              });

              if (results.boats.length === 0) {
                return {
                  message: `I couldn't find any boats in ${locationData.formatted_address} matching your criteria. Would you like to try a different location or adjust your requirements?`,
                  location: locationData.formatted_address,
                  totalCount: 0
                };
              }

              // Format results for conversational presentation
              const boats = results.boats.map((boat: Boat) => ({
                id: boat.id,
                name: boat.name,
                category: boat.category,
                lengthFt: boat.lengthFt,
                capacity: boat.capacity,
                features: boat.features || [],
                mainImage: boat.mainImage,
                price: boat.pricingTiers?.[0]?.price || 'Custom pricing',
                description: boat.description
              }));

              // Determine how many boats to show based on user request
              const boatsToShow = showAll ? boats : boats.slice(0, Math.min(limit, 6));
              const shownCount = boatsToShow.length;
              
              return {
                boats: boatsToShow,
                totalCount: results.totalCount,
                location: locationData.formatted_address,
                message: "Here are some options:",
                hasMore: results.totalCount > shownCount,
                searchCriteria: {
                  location: locationData.formatted_address,
                  groupSize,
                  budget,
                  category,
                  features,
                  minLength,
                  maxLength,
                  sortBy
                }
              };

            } catch (error) {
              console.error('Error searching boats:', error);
              return {
                error: 'I encountered an error while searching for boats. Please try again.'
              };
            }
          },
        }),
      },
      system: `You are KOS Yachts' professional boat charter assistant. You help customers find the perfect boat by understanding their needs and providing intelligent, responsive search results.

CONVERSATION APPROACH:
- Be conversational but professional
- Ask clarifying questions when needed
- Adapt your search strategy based on user requests
- Provide helpful suggestions and alternatives

SEARCH INTELLIGENCE:
- Use searchBoats tool with appropriate parameters based on user requests
- When user asks for "more boats" or "different options", use excludeBoatIds to avoid duplicates
- When user asks for "all boats" or "show everything", set showAll=true
- When user asks for specific numbers (e.g., "show me 10 boats"), use limit parameter
- When user asks for specific sorting (e.g., "cheapest first", "largest boats"), use sortBy parameter
- When user asks for different criteria (e.g., "smaller boats", "luxury yachts"), adjust filters accordingly

RESPONSIVE BEHAVIOR:
- If user says "show me more" → exclude previously shown boats and search again
- If user says "show me all" → set showAll=true and limit=12
- If user says "cheapest options" → use sortBy="price_asc"
- If user says "largest boats" → use sortBy="length_desc"
- If user says "newest boats" → use sortBy="newest"
- If user changes criteria → search with new parameters
- If user asks for specific number → use limit parameter
- If user complains about same results → try different sorting or adjust criteria

LOCATION HANDLING:
- Accept any location format (city, state, region, landmarks)
- For Florida: distinguish East Coast (Miami, Fort Lauderdale) vs West Coast (Naples, Marco Island)
- Suggest popular charter destinations if user is unsure

RESPONSE FORMAT:
- Keep responses very concise and focused
- When showing boats, use simple phrases like "Here are some options:" or "I found these boats:"
- NEVER list boat names, prices, or details in the text response
- Let the boat cards display all the information
- When no boats found, suggest alternatives or refinements
- Always acknowledge user requests before searching
- If user complains about repeated results, apologize and try a different approach

IMPORTANT RULES:
- Never repeat the same search parameters if user complains about same results
- Always try different sorting or criteria when user asks for "different" options
- If exclusion isn't working, try changing sort order or adding/removing filters
- Be honest if you can't find more options and suggest alternatives
- Keep text responses minimal - let boat cards do the talking
- Use phrases like "Here are some options:" or "I found these boats:" when showing results
- Never list boat details in text when boat cards are being shown

COMPANY INFORMATION IF ASKED - ONLY USE THIS INFORMATION IF ASKED DIRECTLY:
- We are KOS Yachts
- We are based in Miami, Florida
-We are full service yacht charter
-our policies can be found respectively at /cancellation-policy and /terms-of-service and /cookies
-we have over 300 boats to choose from
-we have a 100% satisfaction guarantee
-we have a 100% money back guarantee
-we have a 100% customer satisfaction guarantee
-we have a 100% customer satisfaction guarantee
-we have 20+ professional captains
-our contact info is contact@kosyachts.com
-our phone number is +1 (305) 521-8877
-our booking calendar appointments is https://api.leadconnectorhq.com/widget/bookings/kos-calendars
-our website is https://kosyachts.com
-our facebook is https://facebook.com/kosyachts
-our instagram is https://instagram.com/kosyachts
-our twitter is https://twitter.com/kosyachts
    `,
});

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chatbot API error:', error);
    return new Response('Sorry, I encountered an error. Please try again.', { 
      status: 500 
    });
  }
}