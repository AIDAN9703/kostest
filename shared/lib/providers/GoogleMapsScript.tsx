"use client";

import Script from "next/script";

/**
 * Loads the Google Maps JS API once for the whole app. `afterInteractive`
 * (not `beforeInteractive`) — in the App Router a beforeInteractive script
 * rendered inside <body> becomes a raw <script> in the React tree that
 * never executes on client renders (React warns loudly). Every consumer
 * already polls window.google for readiness, so post-hydration loading is
 * safe.
 */
export default function GoogleMapsScript() {
  return (
    <Script
      id="google-maps-script"
      strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`}
    />
  );
}
