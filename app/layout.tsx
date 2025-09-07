import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import GoogleMapsScript from "@/shared/providers/GoogleMapsScript";
import { ImageKitProvider } from "@imagekit/next";
import CookiesConsent from "@/shared/components/CookiesConsent";
import { NuqsAdapter } from "nuqs/adapters/next/app";


const openSans = localFont({
  src: [
    { path: "/fonts/OpenSans-Regular.ttf", style: "normal" },
    { path: "/fonts/OpenSans-Italic.ttf", style: "italic" },
    { path: "/fonts/OpenSans-Bold.ttf", weight: "700", style: "normal" },
    { path: "/fonts/OpenSans-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "/fonts/OpenSans-Light.ttf", weight: "300", style: "normal" },
    { path: "/fonts/OpenSans-Semibold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-open-sans",
});

const poppins = localFont({
  src: [
    { path: "/fonts/Poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "/fonts/Poppins/Poppins-Italic.ttf", weight: "400", style: "italic" },
    { path: "/fonts/Poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
    { path: "/fonts/Poppins/Poppins-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "/fonts/Poppins/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "/fonts/Poppins/Poppins-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "/fonts/Poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "/fonts/Poppins/Poppins-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "/fonts/Poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "/fonts/Poppins/Poppins-SemiBoldItalic.ttf", weight: "600", style: "italic" },
  ],
  variable: "--font-poppins",
});


const bebasNeue = localFont({
  src: [
    { path: "/fonts/BebasNeue-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--bebas-neue",
});

export const metadata: Metadata = {
  title: {
    default: "Kings Of The Sea Yachts | Luxury Yacht Charters",
    template: "%s | KOS Yachts"
  },
  description: "Set sail with Kings of the Sea Yachts' international fleet. From Miami luxury charters to worldwide parties & events, book unforgettable adventures.",
  keywords: [
    "yacht charter Miami",
    "boat rental Miami", 
    "luxury yacht Miami",
    "fishing charter Miami",
    "private yacht Miami",
    "Kings Of The Sea yachts",
    "KOS yachts",
    "yacht rental Florida",
    "boat charter Miami",
    "yacht charter Fort Lauderdale",
    "luxury boat rental",
    "private yacht charter"
  ],
  authors: [{ name: "Kings Of The Sea Yachts" }],
  creator: "Kings Of The Sea Yachts",
  publisher: "Kings Of The Sea Yachts",
  metadataBase: new URL("https://www.kosyachts.com"),
  alternates: {
    canonical: "https://www.kosyachts.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.kosyachts.com",
    siteName: "Kings Of The Sea Yachts",
    title: "Kings Of The Sea Yachts - Luxury Yacht Charters Miami",
    description: "Experience luxury yacht charters in Miami with Kings Of The Sea Yachts. Premium boat rentals and private yacht experiences.",
    images: [
      {
        url: "https://www.kosyachts.com/images/herooption22.jpg",
        width: 1200,
        height: 630,
        alt: "Luxury yachts in Miami waters - Kings Of The Sea Yachts",
      },
      {
        url: "https://www.kosyachts.com/clients/koshat.jpeg",
        width: 800,
        height: 1200,
        alt: "Kings Of The Sea Yachts branded cap and lifestyle - luxury yacht charter experience",
      },
      {
        url: "https://www.kosyachts.com/clients/niceyacht.jpg",
        width: 1600,
        height: 900,
        alt: "Luxury yacht interior with panoramic Miami views - Kings Of The Sea Yachts",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kings Of The Sea Yachts - Luxury Yacht Charters Miami",
    description: "Experience luxury yacht charters in Miami with Kings Of The Sea Yachts. Premium boat rentals and private yacht experiences.",
    images: [
      "https://www.kosyachts.com/images/herooption22.jpg",
      "https://www.kosyachts.com/clients/koshat.jpeg",
      "https://www.kosyachts.com/clients/niceyacht.jpg"
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  // Add structured data for rich search results
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Kings Of The Sea Yachts",
      "alternateName": "KOS Yachts",
      "description": "Luxury yacht charters in Miami with premium boat rentals and private yacht experiences",
      "url": "https://www.kosyachts.com",
      "logo": "https://www.kosyachts.com/logo.png",
      "image": [
        "https://www.kosyachts.com/images/herooption22.jpg",
        "https://www.kosyachts.com/clients/koshat.jpeg",
        "https://www.kosyachts.com/clients/niceyacht.jpg"
      ],
      "category": "Yacht Charter",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Miami",
        "addressRegion": "FL",
        "addressCountry": "US"
      },
      "telephone": "+1-305-XXX-XXXX",
      "priceRange": "$$$",
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 25.7617,
          "longitude": -80.1918
        },
        "geoRadius": "50000"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Yacht Charter Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Luxury Yacht Charters",
              "description": "Premium yacht charters in Miami"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Fishing Charters",
              "description": "Professional fishing charters in Miami waters"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Private Yacht Experiences",
              "description": "Exclusive private yacht charters"
            }
          }
        ]
      }
    })
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PQTQNKBB');`
        }} />
        {/* End Google Tag Manager */}
        <GoogleMapsScript />
      </head>
      <body className={`${openSans.className} ${bebasNeue.variable} ${openSans.variable} ${poppins.variable} antialiased`}>
        <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}>
          <SessionProvider>
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
            <Toaster />
            <CookiesConsent />
          </SessionProvider>
        </ImageKitProvider>
      </body>
    </html>
  );
}

export default RootLayout;

