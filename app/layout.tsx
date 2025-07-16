import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import GoogleMapsScript from "@/components/providers/GoogleMapsScript";
import { ImageKitProvider } from "@imagekit/next";

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

const ibmPlexSans = localFont({
  src: [
    { path: "/fonts/IBMPlexSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "/fonts/IBMPlexSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "/fonts/IBMPlexSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "/fonts/IBMPlexSans-Bold.ttf", weight: "700", style: "normal" },
  ],
});

const bebasNeue = localFont({
  src: [
    { path: "/fonts/BebasNeue-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--bebas-neue",
});

export const metadata: Metadata = {
  title: "KOS Yachts",
  description: "KOS Yachts is the leading yacht charter experience in the South Florida area. We offer a wide range of yachts for rent, from small to large, for any occasion. Check out our new locations in Connecticut and New York.",
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
      <body className={`${ibmPlexSans.className} ${bebasNeue.variable} ${openSans.variable} ${poppins.variable} antialiased`}>
        <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ImageKitProvider>
      </body>
    </html>
  );
}

export default RootLayout;

