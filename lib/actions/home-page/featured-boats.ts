import { db } from "@/database/db";
import { boats } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Boat, ActionResponse } from "@/lib/types";
import { cachedFetch } from '@/lib/utils';

export async function getFeaturedBoats(): Promise<ActionResponse<Boat[]>> {
  "use server";
  
  return cachedFetch<ActionResponse<Boat[]>>(
    'featured-boats',
    async () => {
      try {
        const featuredBoats = await db
          .select()
          .from(boats)
          .where(eq(boats.featured, true))
          .orderBy(boats.featuredOrder);

        return {
          success: true,
          data: featuredBoats
        };
      } catch (error) {
        console.error("Error fetching featured boats:", error);
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