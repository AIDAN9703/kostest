import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";

// Force static generation - this coming soon page has no dynamic content
export const dynamic = "force-static";

export default function KOSYachtClubPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/koshero.jpg"
          alt="KOS Yacht Club"
          fill
          className="object-cover"
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto text-white">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/icons/transparent-white-logo.webp"
              alt="KOS Logo"
              width={120}
              height={120}
              className="mx-auto object-contain"
              quality={90}
            />
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 leading-tight">
            KOS Yacht Club
          </h1>

          <h2 className="text-2xl md:text-3xl font-light mb-6 text-white/90">
            Coming Soon
          </h2>

          <p className="text-lg md:text-xl leading-relaxed font-light text-white/80 mb-12 max-w-lg mx-auto">
            An exclusive members-only experience featuring the finest luxury
            yacht charters, premium amenities, and unparalleled service.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 px-8 py-4 font-medium"
              >
                Get Notified
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="mailto:contact@kosyachts.com">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white/40 hover:bg-white/10 px-8 py-4 font-medium"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
