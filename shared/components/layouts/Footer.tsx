"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, Phone, MapPin, Send } from "lucide-react";
import { FaYoutube, FaTiktok } from "react-icons/fa";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

// Simplified footer data structure
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
  // Unified styling system - matches navigation approach
  const styles = {
    // Layout
    container: "bg-white",
    wrapper: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20",

    // New layout: left + middle bunched + right
    mainGrid:
      "grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 lg:gap-4 items-start",
    leftSection: "flex flex-col",
    middleSection: "flex flex-col",
    rightSection: "flex flex-col",

    // Typography
    heading:
      "text-lg font-semibold font-poppins tracking-wide text-primary mb-4",
    link: "block text-sm text-gray-600 hover:text-primary transition-colors font-medium",
    linkList: "space-y-4",

    // Brand section (left)
    logo: "rounded-full mb-6 transition-transform hover:scale-105",
    contactItem: "flex items-center gap-3 text-sm text-gray-600 mb-4",
    contactIcon: "w-4 h-4 text-primary flex-shrink-0",
    socialContainer: "flex items-center gap-3 mt-6",
    socialLink:
      "w-10 h-10 rounded-full border border-gray-200 hover:border-primary/30 flex items-center justify-center transition-all hover:scale-110 hover:bg-primary/5",
    socialIcon: "w-4 h-4 text-gray-600 hover:text-primary transition-colors",

    // Link sections (middle) - bunched together
    linkSections: "grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8",
    linkSection: "flex flex-col",

    // Newsletter (right) - matches other sections structure
    newsletterForm: "flex flex-col gap-3 mt-2",
    newsletterInput:
      "bg-gray-50 border-gray-200 focus:border-gold focus:ring-gold/20 h-12",
    newsletterButton:
      "bg-primary text-white h-12 font-medium flex items-center justify-center gap-2",

    // Bottom bar
    bottomBar: "mt-16 pt-8 border-t border-gray-100",
    bottomContent:
      "flex flex-col md:flex-row justify-between items-center gap-4",
    copyright: "text-gray-500 text-sm",
    legalLinks: "flex flex-wrap items-center justify-center gap-6 md:gap-8",
    legalLink: "text-gray-500 hover:text-primary transition-colors text-sm",
  };

  return (
    <footer className={styles.container}>
      <div className={styles.wrapper}>
        {/* Main footer content */}
        <div className={styles.mainGrid}>
          {/* Left: Brand section */}
          <div className={styles.leftSection}>
            <Link href="/" className="block">
              <Image
                src="/icons/transparent-logo.png"
                alt="KOS Yachts"
                width={56}
                height={56}
                className={styles.logo}
              />
            </Link>

            {/* Contact info */}
            <div className="space-y-4">
              <div className={styles.contactItem}>
                <Phone className={styles.contactIcon} />
                <span>(305) 521-8877</span>
              </div>
              <div className={styles.contactItem}>
                <Mail className={styles.contactIcon} />
                <span>contact@kosyachts.com</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin className={styles.contactIcon} />
                <span>Miami, FL</span>
              </div>
            </div>

            {/* Social links */}
            <div className={styles.socialContainer}>
              <a
                href="https://instagram.com/kosyachts"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <Instagram className={styles.socialIcon} />
              </a>
              <a
                href="https://www.tiktok.com/@kosyachts"
                className={styles.socialLink}
                aria-label="TikTok"
              >
                <FaTiktok className={styles.socialIcon} />
              </a>
              <a
                href="https://www.youtube.com/@Kosyachts"
                className={styles.socialLink}
                aria-label="YouTube"
              >
                <FaYoutube className={styles.socialIcon} />
              </a>
            </div>
          </div>

          {/* Middle: Link sections bunched together */}
          <div className={styles.middleSection}>
            <div className={styles.linkSections}>
              {/* Quick Links */}
              <div className={styles.linkSection}>
                <h3 className={styles.heading}>Quick Links</h3>
                <div className={styles.linkList}>
                  {footerData.quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={styles.link}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className={styles.linkSection}>
                <h3 className={styles.heading}>Locations</h3>
                <div className={styles.linkList}>
                  {footerData.locations.map((location) => (
                    <Link
                      key={location.href}
                      href={location.href}
                      className={styles.link}
                    >
                      {location.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className={styles.linkSection}>
                <h3 className={styles.heading}>Services</h3>
                <div className={styles.linkList}>
                  {footerData.services.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className={styles.link}
                    >
                      {service.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Newsletter section */}
          <div className={styles.rightSection}>
            <h3 className={styles.heading}>Stay Connected</h3>
            <p className="text-sm text-gray-600">
              Get exclusive updates on new charters, special offers, and luxury
              yacht experiences.
            </p>
            <form className={styles.newsletterForm}>
              <Input
                type="email"
                placeholder="Your email address"
                className={styles.newsletterInput}
              />
              <Button type="submit" className={styles.newsletterButton}>
                <Send className="w-4 h-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © 2024 KOS Yachts. All rights reserved.
            </p>
            <div className={styles.legalLinks}>
              {footerData.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.legalLink}
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
