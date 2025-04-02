import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import localFont from "next/font/local";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import NewsletterProvider from "@/components/newsletter/NewsletterProvider";

const openSans = localFont({
  src: [
    { path: "/fonts/OpenSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "/fonts/OpenSans-Semibold.ttf", weight: "600", style: "normal" },
    { path: "/fonts/OpenSans-Bold.ttf", weight: "700", style: "normal" },
    { path: "/fonts/OpenSans-Light.ttf", weight: "300", style: "normal" },
    { path: "/fonts/OpenSans-Italic.ttf", weight: "400", style: "italic" },
    { path: "/fonts/OpenSans-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
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
    { path: "/fonts/Fontspring-DEMO-theseasons-bdit.otf", weight: "700", style: "italic" },
    { path: "/fonts/Fontspring-DEMO-theseasons-it.otf", weight: "400", style: "italic" },
    { path: "/fonts/Fontspring-DEMO-theseasons-bd.otf", weight: "700", style: "normal" },
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
      <SessionProvider session={session}>
        <body className={`${ibmPlexSans.className} ${bebasNeue.variable} ${seasons.variable} ${openSans.className} antialiased`}>
          <NewsletterProvider>
            {children}
          </NewsletterProvider>
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
}
export default RootLayout;

