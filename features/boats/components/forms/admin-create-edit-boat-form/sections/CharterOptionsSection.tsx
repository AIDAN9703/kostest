"use client";

import { Anchor } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { CheckboxGroup } from "@/features/boats/components/forms/FormHelpers";

export function CharterOptionsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Anchor className="h-4 w-4" />
          Charter Configuration
        </CardTitle>
        <CardDescription>Charter and booking options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
          <CheckboxGroup 
            fields={[
              { name: 'crewRequired', label: 'Crew Required', description: 'This boat requires a crew to operate' },
              { name: 'crewIncluded', label: 'Crew Included', description: 'Crew is included in the price' },
              { name: 'dayCharter', label: 'Day Charter', description: 'Available for day charters' },
              { name: 'termCharter', label: 'Term Charter', description: 'Available for multi-day charters' },
              { name: 'instantBook', label: 'Instant Book', description: 'Allow instant booking without approval' },
              { name: 'fuelIncluded', label: 'Fuel Included', description: 'Fuel is included in the price' }
            ]}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          />
      </CardContent>
    </Card>
  );
}


