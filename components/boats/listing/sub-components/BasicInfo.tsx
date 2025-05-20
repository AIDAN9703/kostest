"use client";

import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users } from "lucide-react";
import { Boat } from "@/lib/types/types";
import { formatCurrency } from "@/lib/utils/general-utils";
import { GiCaptainHatProfile } from "react-icons/gi";
import { TbRulerMeasure } from "react-icons/tb";

interface BasicInfoProps {
  boat: Boat;
}

export function BasicInfo({ boat }: BasicInfoProps) {
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
                key={boat.averageRating}
                className="w-4 h-4 text-emerald-400"
                fill="currentColor"
              />
    
          </div>
          <span className="font-semibold text-gray-600">{boat.averageRating || "4.7"}</span>
          <span className="text-gray-600">({boat.totalReviews || 111} bookings)</span>
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

        {/* Response Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div className="font-medium text-gray-900">99%</div>
              <div className="text-xs text-gray-600">Response rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 