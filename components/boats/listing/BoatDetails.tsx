"use client";

import { Boat } from "@/lib/types/types";
import { ImageGallery } from "./sub-components/ImageGallery";
import { BasicInfo } from "./sub-components/BasicInfo";
import { Description } from "./sub-components/Description";
import { BoatSpecs } from "./sub-components/BoatSpecs";
import { BookingDetails } from "./sub-components/BookingDetails";
import { FeaturesAmenities } from "./sub-components/FeaturesAmenities";
import { Reviews } from "./sub-components/Reviews";

interface BoatDetailsProps {
  boat: Boat;
}

export default function BoatDetails({ boat }: BoatDetailsProps) {
 
  // Structure for consistent section spacing
  const sectionClass = "border-t border-gray-200 py-4 sm:py-10";
  
  return (
    <article>
      {/* Image Gallery */}

      
      <header>
        <BasicInfo boat={boat} />
      </header>
      
      {/* Description */}
      <section className={sectionClass}>
        <Description boat={boat} />
      </section>
      
      {/* Vessel Specifications */}
      <section className={sectionClass}>
        <BoatSpecs boat={boat} />
      </section>
      
      {/* Booking Requirements */}
      <section className={sectionClass}>
        <BookingDetails boat={boat} />
      </section>
      
      {/* Features & Amenities */}
      <section className={sectionClass}>
        <FeaturesAmenities boat={boat} />
      </section>
      
      {/* Reviews */}
      <section className={sectionClass}>
        <Reviews boat={boat} />
      </section>
    </article>
  );
} 