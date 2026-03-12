"use client";

import { Ruler } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { TextInput, NumberInput } from "@/features/boats/components/forms/FormHelpers";

export function SpecsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ruler className="h-4 w-4" />
          Specs
        </CardTitle>
        <CardDescription>Boat dimensions and capacity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextInput name="make" label="Make" placeholder="e.g., Yamaha, Boston Whaler" />
            <TextInput name="model" label="Model" placeholder="e.g., 242 Limited S" />
            <NumberInput name="yearBuilt" label="Year Built" placeholder="e.g., 2020" />
          </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumberInput name="lengthFt" label="Length (ft)" placeholder="e.g., 24" required />
            <NumberInput name="capacity" label="Capacity" placeholder="e.g., 12" required />
            <NumberInput name="bathrooms" label="Bathrooms" placeholder="e.g., 1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


