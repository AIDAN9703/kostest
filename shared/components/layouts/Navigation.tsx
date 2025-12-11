"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSearchStore } from "@/features/search/store/useSearchStore";
import { AnimatePresence } from "framer-motion";

// Import subcomponents
import MobileNavigation from "./sub-components/MobileNavigation";
import DesktopNavigation from "./sub-components/DesktopNavigation";
import UserMenu from "./sub-components/UserMenu";
import SocialLinks from "./sub-components/SocialLinks";
import SearchBar from "@/shared/components/layouts/sub-components/SearchBar";
import {
  navigationData,
  quickLinks,
  SimpleNavItem,
} from "@/shared/lib/constants/navigation-data";

const Navigation = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const user = session?.user;
  const isHomePage = pathname === "/";
  const {
    isExpanded,
    resetSearchExpansion,
    clearSearchValue,
    clearPlaceDetails,
  } = useSearchStore();

  // Check if user is an admin
  const isAdmin = user?.role === "ADMIN";

  // Reset the isExpanded state when navigating to the home page
  useEffect(() => {
    if (isHomePage) {
      resetSearchExpansion();
    }

    // Clear search values when not on search page
    if (!pathname.includes("/boats/search")) {
      clearSearchValue();
      clearPlaceDetails();
    }
  }, [
    isHomePage,
    resetSearchExpansion,
    pathname,
    clearSearchValue,
    clearPlaceDetails,
  ]);

  // Memoized computed values to prevent unnecessary re-renders
  const showSearchInNav = useMemo(
    () => !isHomePage || (isHomePage && isExpanded),
    [isHomePage, isExpanded]
  );

  // Memoized props for child components to prevent unnecessary re-renders
  const mobileNavProps = useMemo(
    () => ({
      navigationData: navigationData as {
        main: SimpleNavItem[];
        secondary: SimpleNavItem[];
        user: SimpleNavItem[];
      },
      quickLinks,
      user,
      expandedItems,
      setExpandedItems,
      isAdmin,
    }),
    [user, expandedItems, isAdmin]
  );

  const desktopNavProps = useMemo(
    () => ({
      navigationData: navigationData as { main: SimpleNavItem[] },
      expandedItems,
      isAdmin,
    }),
    [expandedItems, isAdmin]
  );

  const userMenuProps = useMemo(
    () => ({
      user,
      navigationData: navigationData as { user: SimpleNavItem[] },
    }),
    [user]
  );

  const socialLinksProps = useMemo(() => ({}), []);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white backdrop-blur-xs shadow-xs py-3">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="grid grid-cols-[auto_1fr_auto] items-center h-14 gap-4"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Left section: Logo + Main Navigation */}
          <div className="flex items-center gap-3">
            <MobileNavigation {...mobileNavProps} />

            <Link
              href="/"
              className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
              aria-label="Home"
            >
              <Image
                src="/icons/transparent-logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full transition-transform hover:scale-105 filter-blue"
                priority
              />
            </Link>
          </div>

          {/* Center section: Search Bar */}
          <div className="flex justify-center">
            <AnimatePresence>
              {showSearchInNav && (
                <div className="animate-fadeIn w-full max-w-[400px]">
                  <SearchBar variant="nav" />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right section: Navigation + Social + User menu */}
          <div className="hidden lg:flex items-center gap-4">
            <DesktopNavigation {...desktopNavProps} />
            <SocialLinks {...socialLinksProps} />
            <UserMenu {...userMenuProps} />
          </div>

          {/* Mobile right section */}
          <div className="flex lg:hidden items-center gap-4">
            <SocialLinks {...socialLinksProps} />
            <UserMenu {...userMenuProps} />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
