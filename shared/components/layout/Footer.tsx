'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Send } from 'lucide-react';
import { FaYoutube, FaTiktok } from 'react-icons/fa';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/components/ui/accordion';

// Setup footer sections for better organization
const quickLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Our Fleet", href: "/boats/search" },
  { label: "KOS Yacht Club", href: "/kos-yacht-club" },
  { label: "FAQ", href: "/faq" },
  { label: "Store", href: "https://kosyachts.myshopify.com/" },
  { label: "News", href: "/news" }
];

const locations = [
  {
    label: 'Miami',
    href: '/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=25.85578602396197&ne_lng=-80.13217904641093&sw_lat=25.7090419531335&sw_lng=-80.31860792381018&zoom_level=13&map_toggle=on',
  },
  {
    label: 'Fort Lauderdale',
    href: '/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=26.342075651857815&ne_lng=-79.94274801289657&sw_lat=25.85493658661458&sw_lng=-80.27851766621689&zoom_level=13&map_toggle=on&page=1',
  },
  {
    label: 'Naples',
    href: '/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=26.78162320580448&ne_lng=-81.53055713088251&sw_lat=25.80900322954124&sw_lng=-82.20209643752314&zoom_level=13&map_toggle=on&page=1',
  },
  {
    label: 'West Palm Beach',
    href: '/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=27.20361325071068&ne_lng=-79.67871662569503&sw_lat=26.234574624628717&sw_lng=-80.35025593233566&zoom_level=13&map_toggle=on&page=1',
  },
  {
    label: 'Connecticut',
    href: '/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=42.52785484619885&ne_lng=-71.37854485044119&sw_lat=39.24828154025446&sw_lng=-74.06470207700369&zoom_level=13&map_toggle=on&page=1',
  },
  {
    label: 'Bahamas',
    href: '/boats/search?near=The+Bahamas&ne_lat=26.590274469914576&ne_lng=-76.65761869261429&sw_lat=22.560024925745196&sw_lng=-79.35476224730179&zoom_level=8&map_toggle=on&center_lat=24.591364629076335&center_lng=-78.00619046995804&page=1',
  },
  {
    label: 'Dominican Republic',
    href: '/boats/search?near=Dominican+Republic&ne_lat=27.00077435235987&ne_lng=-65.31237564053237&sw_lat=10.272085808139986&sw_lng=-76.10094985928237&zoom_level=6&map_toggle=on&center_lat=18.844302328127366&center_lng=-70.70666274990737&page=1',
  }
];

const services = [
  { label: "Charter Management", href: "/services/charter-management" },
  { label: "Yacht Management", href: "/services/yacht-management" },
  { label: "Sales/Purchase", href: "/services/sales" },
  { label: "Term Charters", href: "/services/term-charters" },
  { label: "Dock Management", href: "/services/dock-management" }
];

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-8">
        {/* Mobile-first layout */}
        <div className="md:hidden space-y-8">
          {/* Brand + Social */}
          <div className="flex items-center justify-between">
            <Link href="/" className="block">
              <Image
                src="/icons/logo.png"
                alt="KOS Yachts"
                width={48}
                height={48}
                className="rounded-full"
              />
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary/30 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4.5 h-4.5 text-gray-600" />
              </a>
              <a
                href="https://tiktok.com"
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary/30 flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="w-4.5 h-4.5 text-gray-600" />
              </a>
              <a
                href="https://youtube.com"
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary/30 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="w-4.5 h-4.5 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <h3 className="text-base font-medium text-primary mb-2">Join the KOS Yacht Club Newsletter</h3>
            <p className="text-sm text-gray-600 mb-3">Insider access to yachts, events, and exclusive offers.</p>
            <form>
              <div className="flex items-stretch rounded-full border border-gray-200 overflow-hidden bg-white">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-transparent border-0 focus:ring-0 focus-visible:outline-none px-4 py-2.5 text-sm rounded-none"
                />
                <Button
                  type="submit"
                  className="bg-gold hover:bg-gold/90 text-white rounded-none rounded-r-full h-10 px-4 text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Collapsible sections */}
          <Accordion type="multiple" className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
            <AccordionItem value="quick-links" className="px-4">
              <AccordionTrigger className="py-4 text-primary">Quick Links</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {quickLinks.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-gray-600 hover:text-primary transition-colors text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="locations" className="px-4">
              <AccordionTrigger className="py-4 text-primary">Locations</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {locations.map(location => (
                    <li key={location.label}>
                      <Link href={location.href} className="text-gray-600 hover:text-primary transition-colors text-sm">
                        {location.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="services" className="px-4">
              <AccordionTrigger className="py-4 text-primary">Services</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {services.map(service => (
                    <li key={service.label}>
                      <Link href={service.href} className="text-gray-600 hover:text-primary transition-colors text-sm">
                        {service.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="md:col-span-3">
            <Link href="/" className="block mb-6">
              <Image
                src="/icons/logo.png"
                alt="KOS Yachts"
                width={56}
                height={56}
                className="rounded-full"
              />
            </Link>
            <p className="text-gray-600 leading-relaxed mb-6">
              Luxury charters and curated experiences across Miami, the Bahamas, and beyond.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/kosyachts" className="w-10 h-10 rounded-full border border-gray-200 hover:border-primary/30 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-gray-700" />
              </a>
              <a href="https://tiktok.com/@kosyachts" className="w-10 h-10 rounded-full border border-gray-200 hover:border-primary/30 flex items-center justify-center transition-colors" aria-label="TikTok">
                <FaTiktok className="w-5 h-5 text-gray-700" />
              </a>
              <a href="https://youtube.com" className="w-10 h-10 rounded-full border border-gray-200 hover:border-primary/30 flex items-center justify-center transition-colors" aria-label="YouTube">
                <FaYoutube className="w-5 h-5 text-gray-700" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-primary font-serif text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-600 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div className="md:col-span-2">
            <h3 className="text-primary font-serif text-lg mb-4">Locations</h3>
            <ul className="space-y-3">
              {locations.map(location => (
                <li key={location.label}>
                  <Link href={location.href} className="text-gray-600 hover:text-primary transition-colors">
                    {location.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h3 className="text-primary font-serif text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              {services.map(service => (
                <li key={service.label}>
                  <Link href={service.href} className="text-gray-600 hover:text-primary transition-colors">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (right-most) */}
          <div className="md:col-span-3">
            <div className="rounded-2xl border border-gray-200 p-4">
              <h3 className="text-primary font-medium mb-2">Join the KOS Yacht Club Newsletter</h3>
              <p className="text-sm text-gray-600 mb-3">Insider access to yachts, events, and exclusive offers.</p>
              <form>
                <div className="flex items-stretch rounded-full border border-gray-200 bg-white overflow-hidden">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent border-0 focus:ring-0 focus-visible:outline-none px-5 py-3 rounded-none"
                  />
                  <Button
                    type="submit"
                    className="bg-gold hover:bg-gold/90 text-white rounded-none rounded-r-full h-11 px-5 text-sm font-medium"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 md:mt-14 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs sm:text-sm">© 2024 KOS Yachts. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <Link href="/cancellation-policy" className="text-gray-600 hover:text-primary transition-colors text-xs sm:text-sm">Cancellation Policy</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors text-xs sm:text-sm">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-gray-600 hover:text-primary transition-colors text-xs sm:text-sm">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-600 hover:text-primary transition-colors text-xs sm:text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}