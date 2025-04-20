"use client";

import Script from "next/script";

export default function GoogleMapsScript() {
  return (
    <Script
      id="google-maps-script"
      strategy="beforeInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`}
    />
  );
} 