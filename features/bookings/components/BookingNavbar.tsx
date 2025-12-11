"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function BookingNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Container: Responsive max-width with proper padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Logo and Back Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Back Button - Hide text on mobile */}
            <Link
              href={`/boats/search`}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 hidden sm:inline" />
              <span className="hidden sm:inline text-sm font-medium">
                Back to all boats
              </span>
            </Link>

            {/* Divider - Hide on mobile */}
            <div className="hidden sm:block h-6 w-px bg-gray-300" />

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/icons/transparent-logo.png"
                alt="KOS Logo"
                width={28}
                height={28}
                className="sm:w-8 sm:h-8 rounded-full"
              />
            </Link>
          </div>

          {/* Right: Booking Links */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Help Link */}
            <Link
              href="/help"
              className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>

            {/* Cancellation Policy - Hide on mobile, show short version on tablet */}
            <Link
              href="/cancellation-policy"
              className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="hidden lg:inline">Cancellation policies</span>
              <span className="lg:hidden">Policies</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
