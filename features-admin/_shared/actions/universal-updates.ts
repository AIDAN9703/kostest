"use server";

import { db } from "@/database/db";
import { boats, bookings, users, generalInquiries } from "@/database/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ADMIN_FIELD_DROPDOWN_OPTIONS, type FieldOption } from "@/shared/constants/admin-field-dropdown-constants";

// Define allowed entities and their corresponding database tables
const ENTITY_TABLES = {
  booking: bookings,
  inquiry: generalInquiries,
  boat: boats,
  user: users,
} as const;

type EntityType = keyof typeof ENTITY_TABLES;

/**
 * Universal field update action with security validation
 */
export async function updateField(
  entity: EntityType,
  id: string,
  field: string,
  value: any
) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized - Admin access required"
      };
    }

    // 2. Validate entity type
    if (!Object.keys(ENTITY_TABLES).includes(entity)) {
      return {
        success: false,
        error: "Invalid entity type"
      };
    }

    // 3. Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return {
        success: false,
        error: "Invalid ID format"
      };
    }

    // 4. Validate field is allowed for this entity
    const entityConfig = ADMIN_FIELD_DROPDOWN_OPTIONS[entity];
    if (!entityConfig || !entityConfig[field]) {
      return {
        success: false,
        error: `Field '${field}' is not allowed for ${entity}`
      };
    }

    // 5. Validate value is in allowed options
    const fieldConfig = entityConfig[field];
    const isValidValue = fieldConfig.options.some((option: FieldOption) => 
      option.value === value || 
      (typeof option.value === "boolean" && option.value.toString() === value.toString())
    );
    
    if (!isValidValue) {
      return {
        success: false,
        error: `Invalid value '${value}' for field '${field}'`
      };
    }

    // 6. Get the database table
    const table = ENTITY_TABLES[entity];

    // 7. Update the field
    const updateData = {
      [field]: value,
      updatedAt: new Date()
    };

    await db
      .update(table)
      .set(updateData)
      .where(eq((table as any).id, id));

    // 8. Revalidate relevant paths
    const revalidationPaths = getRevalidationPaths(entity);
    revalidationPaths.forEach(path => revalidatePath(path));

    return {
      success: true,
      message: `${fieldConfig.label || field} updated successfully`
    };

  } catch (error) {
    console.error("Error updating field:", error);
    return {
      success: false,
      error: "Failed to update field. Please try again."
    };
  }
}

/**
 * Get revalidation paths based on entity type
 */
function getRevalidationPaths(entity: EntityType): string[] {
  const pathMap = {
    booking: ["/admin/bookings"],
    inquiry: ["/admin/bookings"],
    boat: ["/admin/boats"],
    user: ["/admin/users"]
  };
  
  return pathMap[entity] || [];
} 