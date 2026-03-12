"use client";

import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ArrayField } from "@/features/boats/components/forms/FormHelpers";

export function FeaturesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-4 w-4" />
          Features & Equipment
        </CardTitle>
        <CardDescription>Boat features and safety equipment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
          <ArrayField 
            name="features" 
            label="Boat Features" 
            placeholder="Add a feature (e.g., GPS, Air Conditioning, Sound System)" 
            required 
            addButtonText="Add Feature" 
          />

        <div className="space-y-4">
          <ArrayField 
            name="safetyEquipment" 
            label="Safety Equipment" 
            placeholder="Add safety equipment (e.g., Life Jackets, Fire Extinguisher, First Aid Kit)" 
            addButtonText="Add Equipment" 
          />
        </div>
      </CardContent>
    </Card>
  );
}


