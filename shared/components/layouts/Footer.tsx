"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, Phone, MapPin, Send } from "lucide-react";
import { FaYoutube, FaTiktok } from "react-icons/fa";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const footerData = {
  quickLinks: [
    { label: "About Us", href: "/about-us" },
    { label: "Our Fleet", href: "/boats/search" },
    { label: "KOS Yacht Club", href: "/kos-yacht-club" },
    { label: "FAQ", href: "/faq" },
    { label: "Store", href: "https://kosyachts.myshopify.com/" },
    { label: "News", href: "/news" },
  ],
  locations: [
    { label: "Miami", href: "/boats/search?near=Miami" },
    { label: "Fort Lauderdale", href: "/boats/search?near=Fort+Lauderdale" },
    { label: "Naples", href: "/boats/search?near=Naples" },
    { label: "West Palm Beach", href: "/boats/search?near=West+Palm+Beach" },
    { label: "Connecticut", href: "/boats/search?near=Connecticut" },
    { label: "Bahamas", href: "/boats/search?near=The+Bahamas" },
  ],
  services: [
    { label: "Charter Management", href: "/services/charter-management" },
    { label: "Yacht Management", href: "/services/yacht-management" },
    { label: "Sales/Purchase", href: "/services/sales" },
    { label: "Dock Management", href: "/services/dock-management" },
  ],
  legal: [
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-10 lg:gap-6">
          {/* Brand */}
          <div className="flex flex-col max-w-[240px]">
            <Link href="/" className="block mb-4 rounded-full hover:scale-105 transition-transform">
              <Image
                src="/icons/transparent-logo.png"
                alt="KOS Yachts"
                width={48}
                height={48}
                className="rounded-full"
              />
            </Link>

            <div className="space-y-2.5">
              <a
                href="tel:+13055218877"
                className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-primary shrink-0" />
                (305) 521-8877
              </a>
              <a
                href="mailto:contact@kosyachts.com"
                className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary shrink-0" />
                contact@kosyachts.com
              </a>
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                Miami, FL
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-6">
              {[
                {
                  href: "https://instagram.com/kosyachts",
                  label: "Instagram",
                  icon: Instagram,
                },
                {
                  href: "https://www.tiktok.com/@kosyachts",
                  label: "TikTok",
                  icon: FaTiktok,
                },
                {
                  href: "https://www.youtube.com/@Kosyachts",
                  label: "YouTube",
                  icon: FaYoutube,
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition-all hover:border-primary/30 hover:bg-primary/5"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-gray-600 transition-colors hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10 lg:justify-items-center">
            <div>
              <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-primary">
                Quick Links
              </h3>
              <div className="space-y-2.5">
                {footerData.quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-primary">
                Locations
              </h3>
              <div className="space-y-2.5">
                {footerData.locations.map((loc) => (
                  <Link
                    key={loc.href}
                    href={loc.href}
                    className="block text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {loc.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-primary">
                Services
              </h3>
              <div className="space-y-2.5">
                {footerData.services.map((svc) => (
                  <Link
                    key={svc.href}
                    href={svc.href}
                    className="block text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {svc.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-full sm:max-w-[300px]">
            <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Stay Connected
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              Get exclusive updates on new charters, special offers, and luxury yacht experiences.
            </p>
            <form className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="h-10 rounded-lg border-gray-200 bg-white text-sm focus:border-gold focus:ring-gold/20"
              />
              <Button
                type="submit"
                className="flex h-10 min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium"
              >
                <Send className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-200 pt-6">
          <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
            <p className="text-center text-sm text-gray-600 md:text-left">
              &copy; {new Date().getFullYear()} KOS Yachts. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {footerData.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
