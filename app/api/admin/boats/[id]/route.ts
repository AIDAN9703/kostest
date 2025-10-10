import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import { updateBoatSchema } from "@/features/boats/boat.validation";
import { apiSuccess, apiSuccessNoData, apiError } from "@/shared/utils/api-response";

/**
 * GET /api/admin/boats/[id]
 * Fetch single boat by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    const boat = await boatService.getBoatById(id);

    if (!boat) {
      return apiError("Boat not found", 404);
    }

    return apiSuccess(boat);

  } catch (error) {
    console.error("Error fetching boat:", error);
    return apiError("Failed to fetch boat");
  }
}

/**
 * PATCH /api/admin/boats/[id]
 * Update boat
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    const body = await request.json();
    
    // Validate with Zod
    const validation = updateBoatSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError("Invalid boat data", 400);
    }

    const updatedBoat = await boatService.updateBoat(id, validation.data);

    return apiSuccess(updatedBoat);

  } catch (error) {
    console.error("Error updating boat:", error);
    return apiError("Failed to update boat");
  }
}

/**
 * DELETE /api/admin/boats/[id]
 * Delete boat
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return apiError("Admin access required", 403);
    }

    await boatService.deleteBoat(id);

    return apiSuccessNoData("Boat deleted successfully");

  } catch (error) {
    console.error("Error deleting boat:", error);
    return apiError("Failed to delete boat");
  }
}
