"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// Import subcomponents
import MobileNavigation from "./sub-components/MobileNavigation";
import DesktopNavigation from "./sub-components/DesktopNavigation";
import UserMenu from "./sub-components/UserMenu";
import SearchBar from "./sub-components/SearchBar";
import { navigationData, type NavigationData } from "@/shared/lib/constants/navigation-data";

const Navigation = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const isAdmin = user?.isAdmin === true;
  // Show search in nav on all pages except home (hero has its own search bar)
  const showNavSearch = pathname !== "/";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 font-poppins">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Bar */}
        <nav
          className={
            showNavSearch
              ? "flex items-center justify-between h-16 gap-4"
              : "flex items-center justify-between h-20 gap-4"
          }
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Left section: Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            <MobileNavigation navigationData={navigationData} user={user} />

            <Link
              href="/"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full hover:opacity-80"
              aria-label="Home"
            >
              <Image
                src="/icons/transparent-logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full filter-blue"
                priority
              />
            </Link>
          </div>

          {/* Center section: Search Bar (all pages except home) */}
          {showNavSearch && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <Suspense fallback={<div className="w-full h-10" />}>
                <SearchBar variant="compact" />
              </Suspense>
            </div>
          )}

          {/* Right section: Navigation + User menu */}
          <div className="hidden lg:flex items-center gap-6">
            <DesktopNavigation navigationData={navigationData} isAdmin={isAdmin} />
            <UserMenu user={user} navigationData={navigationData} />
          </div>

          {/* Mobile right section */}
          <div className="flex lg:hidden items-center gap-4">
            <UserMenu user={user} navigationData={navigationData} />
          </div>
        </nav>

        {/* Mobile Search Bar (all pages except home) */}
        {showNavSearch && (
          <div className="md:hidden pb-4">
            <Suspense fallback={<div className="w-full h-10" />}>
              <SearchBar variant="compact" />
            </Suspense>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
