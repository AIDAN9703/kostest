"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { TextInput, NumberInput } from "@/features-admin/boats/components/forms/FormHelpers";

export function SpecsSection() {
  return (
    <div className="p-8 border-b border-gray-200">
      <div className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Specs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextInput name="make" label="Make" placeholder="e.g., Yamaha, Boston Whaler" />
            <TextInput name="model" label="Model" placeholder="e.g., 242 Limited S" />
            <NumberInput name="yearBuilt" label="Year Built" placeholder="e.g., 2020" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumberInput name="lengthFt" label="Length (ft)" placeholder="e.g., 24" required defaultToZero />
            <NumberInput name="capacity" label="Capacity" placeholder="e.g., 12" required defaultToZero />
            <NumberInput name="bathrooms" label="Bathrooms" placeholder="e.g., 1" />
          </div>
        </div>
      </div>
    </div>
  );
}


