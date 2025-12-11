"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils/general-utils";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/shared/components/ui/sheet";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { SimpleNavItem } from "@/shared/lib/constants/navigation-data";

type MobileNavigationProps = {
  navigationData: {
    main: SimpleNavItem[];
    secondary: SimpleNavItem[];
    user: SimpleNavItem[];
  };
  quickLinks: Array<{
    icon: React.ComponentType<any>;
    label: string;
    value: string;
    href: string;
  }>;
  user: Session["user"] | undefined | null;
  expandedItems: string[];
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  isAdmin?: boolean;
};

const MobileNavigation = ({
  navigationData,
  quickLinks,
  user,
  expandedItems,
  setExpandedItems,
}: MobileNavigationProps) => {
  const pathname = usePathname();

  const toggleExpanded = useCallback(
    (href: string) => {
      setExpandedItems((prev) =>
        prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href]
      );
    },
    [setExpandedItems]
  );

  // Ultra-simple styling
  const styles = {
    hamburger:
      "text-primary hover:text-primary/80 hover:scale-105 transition-all p-1",
    navItem: "block px-3 py-2 text-sm rounded-md transition-colors",
    navItemActive: "text-primary font-medium",
    navItemInactive: "text-gray-700 hover:text-primary hover:bg-primary/5",
    expandButton:
      "flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors",
    sectionTitle: "text-xs font-semibold text-gray-400 mb-3 px-1",
    chevron: "w-4 h-4 text-gray-400",
    quickLink:
      "flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors",
    quickLinkIcon:
      "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary",
  };

  const getNavItemClass = (isActive: boolean) =>
    cn(
      styles.navItem,
      isActive ? styles.navItemActive : styles.navItemInactive
    );

  return (
    <Sheet modal={true}>
      <SheetTrigger asChild>
        <button className={styles.hamburger} aria-label="Open menu">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className="stroke-current sm:w-8 sm:h-8 w-7 h-7"
            strokeWidth="2"
          >
            <line x1="3" y1="8" x2="29" y2="8" />
            <line x1="3" y1="16" x2="29" y2="16" />
            <line x1="3" y1="24" x2="29" y2="24" />
          </svg>
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[340px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <Image
                src="/icons/logo.png"
                alt="Logo"
                width={42}
                height={42}
                className="rounded-full"
              />
              {user ? (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">
                    Welcome to KOS
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="px-4 py-6">
              {/* Main Navigation */}
              <div className="mb-8">
                <h3 className={styles.sectionTitle}>NAVIGATION</h3>
                <div className="space-y-1">
                  {navigationData.main.map((item, index) => (
                    <div key={item.href} className="rounded-md overflow-hidden">
                      {item.type === "dropdown" &&
                      (item.items || item.sections) ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.href)}
                            className={styles.expandButton}
                            aria-expanded={expandedItems.includes(item.href)}
                          >
                            <span>{item.label}</span>
                            {expandedItems.includes(item.href) ? (
                              <ChevronUp className={styles.chevron} />
                            ) : (
                              <ChevronDown className={styles.chevron} />
                            )}
                          </button>

                          <AnimatePresence>
                            {expandedItems.includes(item.href) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-3 pr-2 py-1">
                                  {item.sections
                                    ? // Render with sections
                                      item.sections.map(
                                        (section, sectionIndex) => (
                                          <div
                                            key={`section-${sectionIndex}`}
                                            className="mb-4"
                                          >
                                            <div className="px-2 py-2 text-xs font-semibold text-gray-500 mt-3 mb-1 uppercase">
                                              {section.title}
                                            </div>
                                            {section.items.map((subItem) => (
                                              <SheetClose
                                                asChild
                                                key={subItem.href}
                                              >
                                                <Link
                                                  href={subItem.href}
                                                  className={getNavItemClass(
                                                    pathname === subItem.href
                                                  )}
                                                >
                                                  {subItem.label}
                                                </Link>
                                              </SheetClose>
                                            ))}
                                          </div>
                                        )
                                      )
                                    : // Render flat items
                                      item.items?.map((subItem) => (
                                        <SheetClose asChild key={subItem.href}>
                                          <Link
                                            href={subItem.href}
                                            className={getNavItemClass(
                                              pathname === subItem.href
                                            )}
                                          >
                                            {subItem.label}
                                          </Link>
                                        </SheetClose>
                                      ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <SheetClose asChild>
                          <Link
                            href={item.href}
                            className={getNavItemClass(pathname === item.href)}
                          >
                            {item.label}
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Navigation */}
              <div className="mb-8">
                <h3 className={styles.sectionTitle}>MORE</h3>
                <div className="grid grid-cols-2 gap-2">
                  {navigationData.secondary.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className={styles.sectionTitle}>QUICK LINKS</h3>
                <div className="space-y-2">
                  {quickLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={styles.quickLink}
                    >
                      <div className={styles.quickLinkIcon}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.value}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            {user ? (
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="w-full"
              >
                Sign out
              </Button>
            ) : (
              <SheetClose asChild>
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(MobileNavigation);
