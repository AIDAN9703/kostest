"use client";

import Link from "next/link";
import Image from "next/image";
import { HelpCircle } from "lucide-react";

export default function BookingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 rounded-full hover:opacity-80" aria-label="KOS home">
          <Image
            src="/icons/transparent-logo.png"
            alt="KOS"
            width={32}
            height={32}
            className="rounded-full"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-gray-50 hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </Link>
          <Link
            href="/cancellation-policy"
            className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-gray-50 hover:text-foreground sm:inline"
          >
            Cancellation
          </Link>
        </div>
      </div>
    </header>
  );
}
