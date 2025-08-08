"use client";

import React, { memo } from "react";
import { formatCurrency } from "@/shared/utils/general-utils";

interface FormHeaderProps {
  price?: number; // base price excluding fees
  hours?: number; // selected duration
}

/**
 * Minimal header that mirrors competitor style:
 * "$650 / 2 hr (excl. fees)" with subtle divider.
 * Pure presentational and memoized to avoid re-renders.
 */
function FormHeaderComponent({ price, hours }: FormHeaderProps) {
  const hasSelection = typeof price === "number" && typeof hours === "number";

  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-primary tracking-tight">
          {hasSelection ? formatCurrency(price) : "Select options"}
        </div>
        <div className="text-sm text-gray-500">
          {hasSelection ? `/ ${hours} hr (excl. fees)` : "to see price"}
        </div>
      </div>
      <div className="mt-4 border-t border-slate-200" />
    </div>
  );
}

export const FormHeader = memo(FormHeaderComponent);

export default FormHeader;

