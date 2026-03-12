import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import { apiSuccess, apiError } from "@/shared/lib/utils/api-helpers";

/**
 * GET /api/admin/boats/[id]/pricing-tiers
 * Fetch pricing tiers for a boat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return apiError("Admin access required", 403);
    }

    const resolvedParams = await params;
    const tiers = await boatService.getBoatPricingTiers(resolvedParams.id);
    
    return apiSuccess(tiers);
  } catch (error) {
    console.error("Error fetching pricing tiers:", error);
    return apiError("Failed to fetch pricing tiers");
  }
}

