import type { AddOnCategory } from "@/features/add-ons/add-on.types";

export const ADD_ON_CATEGORY_LABELS: Record<AddOnCategory, string> = {
  FOOD_BEVERAGE: "Food & Beverage",
  WATER_TOYS: "Water toys",
  FISHING: "Fishing",
  GEAR: "Gear",
  SERVICES: "Services",
  OTHER: "Other",
};

export function addOnCategoryLabel(category: string): string {
  return ADD_ON_CATEGORY_LABELS[category as AddOnCategory] ?? category;
}
