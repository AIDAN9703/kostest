"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Star, MapPin, Users, CalendarClock } from "lucide-react";
import { Boat } from "@/shared/types/types";
import { formatCurrency } from "@/shared/utils/general-utils";
import { GiCaptainHatProfile } from "react-icons/gi";
import { TbRulerMeasure } from "react-icons/tb";
import { format } from "date-fns";

interface BasicInfoProps {
  boat: Boat;
}

export function BasicInfo({ boat }: BasicInfoProps) {
  // Format the created date
  const formattedDate = boat.createdAt 
    ? format(new Date(boat.createdAt), "MMM d, yyyy")
    : "Recently added";

  return (
    <section className="space-y-4 pb-4 sm:pb-8">
      {/* Title, Location, and Rating Container */}
      <div className="space-y-2 md:space-y-0 sm:flex sm:justify-between sm:items-start sm:gap-4">
        {/* Title and Location */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {boat.displayTitle || boat.name}
          </h1>
          {boat.locationLabel && (
            <div className="flex items-center text-primary">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{boat.locationLabel}</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm shrink-0 sm:pt-2">
          <div className="flex">
            <Star
              className="w-4 h-4 text-emerald-400"
              fill="currentColor"
            />
          </div>
          <span className="font-semibold text-gray-600">
            {boat.averageRating ? Number(boat.averageRating).toFixed(1) : "--"}
          </span>
          <span className="text-gray-600">
            ({boat.totalReviews || 0} {boat.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Boat Length */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <TbRulerMeasure className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-gray-900">{boat.lengthFt || "29"} ft</div>
              <div className="text-xs text-gray-600">Boat length</div>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-gray-900">Up to {boat.capacity || 10}</div>
              <div className="text-xs text-gray-600">Passengers</div>
            </div>
          </div>
        </div>

        {/* Captain Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <GiCaptainHatProfile className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-gray-900">Captained</div>
              <div className="text-xs text-gray-600">Charter type</div>
            </div>
          </div>
        </div>

        {/* Added On Date (replaces Starting Rate) */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-gray-900">{formattedDate}</div>
              <div className="text-xs text-gray-600">Added on</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 