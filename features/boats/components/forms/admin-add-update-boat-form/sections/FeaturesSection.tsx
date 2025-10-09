"use client";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrayField } from "@/features/boats/components/forms/FormHelpers";

export function FeaturesSection() {
  return (
    <div className="p-8 border-b border-gray-200">
    

      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Features & Equipment</h3>
          <ArrayField 
            name="features" 
            label="Boat Features" 
            placeholder="Add a feature (e.g., GPS, Air Conditioning, Sound System)" 
            required 
            addButtonText="Add Feature" 
          />
        </div>

        <div className="space-y-4">
          <ArrayField 
            name="safetyEquipment" 
            label="Safety Equipment" 
            placeholder="Add safety equipment (e.g., Life Jackets, Fire Extinguisher, First Aid Kit)" 
            addButtonText="Add Equipment" 
          />
        </div>
      </div>
    </div>
  );
}


