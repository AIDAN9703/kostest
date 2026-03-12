"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Bookmark,
  User,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";
import UserMenu from "@/shared/components/layouts/sub-components/UserMenu";
import { Session } from "next-auth";
import { useState } from "react";
import Image from "next/image";

interface ProfileNavbarProps {
  user: Session["user"] | undefined | null;
}

const navItems = [
  {
    href: "/profile",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/profile/bookings",
    label: "My Bookings",
    icon: Calendar,
  },
  {
    href: "/profile/favorites",
    label: "Favorites",
    icon: Bookmark,
  },
  {
    href: "/profile/settings",
    label: "Account Settings",
    icon: User,
  },
];

export function ProfileNavbar({ user }: ProfileNavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/icons/transparent-logo.png"
              alt="Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              // Determine if this nav item is active
              // For /profile, only match if pathname is exactly /profile (not /profile/captain or /profile/owner)
              const isActive =
                item.href === "/profile"
                  ? pathname === "/profile"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-base font-semibold transition-colors rounded-lg",
                    isActive
                      ? "text-primary bg-gray-100/25"
                      : "text-gray-600 hover:text-primary hover:bg-gray-100/25",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side: Owner Switcher + Hamburger */}
          <div className="flex items-center gap-4">
            {/* Switch to Owner View - Only show if user is owner and not already on owner page */}
            {user?.isOwner && !pathname.includes("/owner") && (
              <Link
                href="/profile/owner"
                className="text-md font-semibold text-gray-600 hover:bg-gray-100/25 rounded-lg px-4 py-2 transition-colors"
              >
                Owner View
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="py-4 space-y-1 border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;

              // Determine if this nav item is active
              // For /profile, only match if pathname is exactly /profile (not /profile/captain or /profile/owner)
              const isActive =
                item.href === "/profile"
                  ? pathname === "/profile"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-base font-semibold transition-colors rounded-lg",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-primary/10",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Switch to Owner View (Mobile) */}
            {user?.isOwner && !pathname.includes("/owner") && (
              <div className="px-4 py-3 border-t border-gray-200 mt-2">
                <Link
                  href="/profile/owner"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs text-gray-600 hover:text-primary transition-colors"
                >
                  Switch to owner view
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
