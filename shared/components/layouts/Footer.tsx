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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-10 lg:gap-6">
          {/* Brand */}
          <div className="flex flex-col max-w-[240px]">
            <Link href="/" className="block mb-5 rounded-full hover:scale-105 transition-transform">
              <Image
                src="/icons/transparent-logo.png"
                alt="KOS Yachts"
                width={52}
                height={52}
                className="rounded-full"
              />
            </Link>

            <div className="space-y-3">
              <a
                href="tel:+13055218877"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary shrink-0" />
                (305) 521-8877
              </a>
              <a
                href="mailto:contact@kosyachts.com"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary shrink-0" />
                contact@kosyachts.com
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
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
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary/30 hover:bg-primary/5 flex items-center justify-center transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-gray-500 hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10 lg:justify-items-center">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-primary mb-4 uppercase">
                Quick Links
              </h3>
              <div className="space-y-3">
                {footerData.quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wide text-primary mb-4 uppercase">
                Locations
              </h3>
              <div className="space-y-3">
                {footerData.locations.map((loc) => (
                  <Link
                    key={loc.href}
                    href={loc.href}
                    className="block text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {loc.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wide text-primary mb-4 uppercase">
                Services
              </h3>
              <div className="space-y-3">
                {footerData.services.map((svc) => (
                  <Link
                    key={svc.href}
                    href={svc.href}
                    className="block text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {svc.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-full sm:max-w-[280px]">
            <h3 className="text-sm font-semibold tracking-wide text-primary mb-4 uppercase">
              Stay Connected
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Get exclusive updates on new charters, special offers, and luxury yacht experiences.
            </p>
            <form className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white border-gray-200 focus:border-gold focus:ring-gold/20 h-11 rounded-lg"
              />
              <Button
                type="submit"
                className="h-11 font-medium flex items-center justify-center gap-2 rounded-lg"
              >
                <Send className="w-4 h-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} KOS Yachts. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6">
              {footerData.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
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
