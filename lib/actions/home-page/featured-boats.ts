import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Boat, ActionResponse } from "@/types/types";
import { cachedFetch } from '@/lib/utils';

export async function getFeaturedBoats(): Promise<ActionResponse<Boat[]>> {
  "use server";
  
  return cachedFetch<ActionResponse<Boat[]>>(
    'featured-boats',
    async () => {
      try {
        console.log("Attempting to fetch featured boats...");
        const featuredBoats = await db
          .select()
          .from(boats)
          .where(eq(boats.featured, true))
          .orderBy(boats.featuredOrder);
        
        console.log(`Successfully fetched ${featuredBoats.length} featured boats`);
        return {
          success: true,
          data: featuredBoats
        };
      } catch (error) {
        console.error("Error fetching featured boats:", error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        return {
          success: false,
          error: "Failed to fetch featured boats"
        };
      }
    },
    {
      revalidate: 3600,
      tags: ['featured-boats']
    }
  );
} 