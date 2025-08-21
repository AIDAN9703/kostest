"use client";

import { CheckboxGroup } from "@/features-admin/boats/components/forms/FormHelpers";

export function CharterOptionsSection() {
  return (
    <div className="p-8 border-b border-gray-200">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Charter Configuration</h3>
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
        </div>
    </div>
  );
}


