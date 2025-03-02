import Image from "next/image";
import { Boat } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Anchor,
  Ship,
  Users,
  Bed,
  Ruler,
  Gauge,
  MapPin,
  Star
} from "lucide-react";

interface BoatDetailsProps {
  boat: Boat;
}

export default function BoatDetails({ boat }: BoatDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={boat.mainImage || boat.primaryPhotoAbsPath || "/images/placeholder-boat.jpg"}
          alt={boat.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{boat.name}</h1>
            <p className="text-gray-500">{boat.displayTitle}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-1">
            ${boat.hourlyRate}/hour
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users />} label="Passengers" value={(boat.capacity || boat.numOfPassengers || 0)} />
          <StatCard icon={<Bed />} label="Cabins" value={(boat.cabins || boat.numOfCabins || 0)} />
          <StatCard icon={<Bed />} label="Bathrooms" value={(boat.bathrooms || boat.numOfBathrooms || 0)} />
          <StatCard icon={<Ruler />} label="Length" value={`${boat.lengthFt} ft`} />
        </div>
      </div>

      {/* Detailed Specs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Vessel Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SpecItem icon={<Ship />} label="Make" value={boat.make} />
            <SpecItem icon={<Anchor />} label="Model" value={boat.model} />
            <SpecItem icon={<Gauge />} label="Max Speed" value={boat.maxSpeed ? `${boat.maxSpeed} knots` : "N/A"} />
            <SpecItem icon={<MapPin />} label="Location" value={boat.homePort || "N/A"} />
          </div>
          <div className="space-y-4">
            <SpecItem icon={<Star />} label="Year Built" value={boat.yearBuilt?.toString()} />
            <SpecItem icon={<Users />} label="Sleeps" value={boat.sleepsNum ? `${boat.sleepsNum} guests` : "N/A"} />
            <SpecItem icon={<Ship />} label="Category" value={boat.category} />
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">About This Vessel</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{boat.description}</p>
      </Card>

      {/* Features */}
      {boat.features && boat.features.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {boat.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center gap-2 text-gray-600">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value || "N/A"}</p>
      </div>
    </div>
  );
} 