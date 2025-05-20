import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/lib/types/types";
import { cachedFetch } from '@/lib/utils/general-utils';
import type { InferSelectModel } from "drizzle-orm";

// Use Drizzle's inferred type instead of a custom Boat type
type DrizzleBoat = InferSelectModel<typeof boats>;

export async function getFeaturedBoats(): Promise<ActionResponse<DrizzleBoat[]>> {
  "use server";
  
  return cachedFetch<ActionResponse<DrizzleBoat[]>>(
    'featured-boats',
    async () => {
      try {
        console.log("Attempting to fetch featured boats...");
        const featuredBoats = await db
          .select()
          .from(boats)
          .where(eq(boats.featured, true));
        
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