import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import localFont from "next/font/local";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import NewsletterProvider from "@/components/newsletter/NewsletterProvider";
import GoogleMapsScript from "@/components/providers/GoogleMapsScript";

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

const seasons = localFont({
  src: [
    { path: "/fonts/Fontspring-DEMO-theseasons-bd.otf", weight: "700", style: "normal" },
    { path: "/fonts/Fontspring-DEMO-theseasons-bdit.otf", weight: "700", style: "italic" },
    { path: "/fonts/Fontspring-DEMO-theseasons-it.otf", weight: "400", style: "italic" },
    { path: "/fonts/Fontspring-DEMO-theseasons-lt.otf", weight: "300", style: "normal" },
    { path: "/fonts/Fontspring-DEMO-theseasons-ltit.otf", weight: "300", style: "italic" },
  ],
  variable: "--font-seasons",
});

export const metadata: Metadata = {
  title: "KOSyachts",
  description: "KOSyachts is the leading yacht charter experience in the South Florida area.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <GoogleMapsScript />
      </head>
      <SessionProvider session={session}>
        <body className={`${ibmPlexSans.className} ${bebasNeue.variable} ${seasons.variable} ${openSans.variable} ${poppins.variable} antialiased`}>
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
}
export default RootLayout;

