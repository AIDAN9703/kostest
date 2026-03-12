"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cn } from "@/shared/lib/utils/general-utils";
import { Crown, ArrowRight } from "lucide-react";
import { NavigationData } from "@/shared/lib/constants/navigation-data";
import { useActiveRoute } from "@/shared/lib/hooks/useActiveRoute";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/shared/components/ui/navigation-menu";

interface DesktopNavigationProps {
  navigationData: Pick<NavigationData, "main">;
  isAdmin?: boolean;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navigationData,
  isAdmin = false,
}) => {
  const { isActive } = useActiveRoute();

  return (
    <div className="hidden lg:flex items-center gap-4">
      {/* Admin crown */}
      {isAdmin && (
        <Link
          href="/admin"
          className="p-1.5 rounded-full hover:bg-primary/5 transition-colors"
          title="Admin Dashboard"
        >
          <Crown className="w-5 h-5 text-primary transition-transform" />
        </Link>
      )}

      {/* Navigation Menu - Custom right-aligned viewport */}
      <NavigationMenuPrimitive.Root className="relative z-10 flex max-w-max flex-1 items-center justify-center">
        <NavigationMenuList className="gap-2">
          {navigationData.main.map((item) => (
            <NavigationMenuItem key={item.href}>
              {item.type === "dropdown" && (item.items || item.sections) ? (
                <>
                  <NavigationMenuTrigger className="text-[15px] font-semibold text-primary data-[state=open]:bg-transparent data-[active]:bg-transparent hover:bg-transparent focus:bg-transparent h-auto py-0 px-0 bg-transparent">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="right-0 left-auto">
                    <div
                      className={cn(
                        "w-[1024px] max-w-[95vw] p-5 bg-white rounded-xl shadow-xl border border-border/60",
                        item.featured
                          ? "grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6"
                          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5",
                      )}
                    >
                      {/* Featured card - About Us / brand spotlight (left side) */}
                      {item.featured && (
                        <Link
                          href={item.featured.href}
                          className="group/featured relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-200"
                        >
                          {item.featured.image && (
                            <div className="relative aspect-[4/3] w-full overflow-hidden">
                              <Image
                                src={item.featured.image}
                                alt={
                                  item.featured.imageAlt || item.featured.title
                                }
                                fill
                                className="object-cover transition-transform duration-200 group-hover/featured:scale-[1.02]"
                                sizes="240px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover/featured:opacity-100" />
                            </div>
                          )}
                          <div className="flex flex-1 flex-col p-4">
                            <h3 className="text-[15px] font-semibold text-primary mb-1.5">
                              {item.featured.title}
                            </h3>
                            <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2 mb-3 flex-1">
                              {item.featured.description}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary group-hover/featured:gap-2 transition-all">
                              {item.featured.ctaText || "Learn More"}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </Link>
                      )}

                      {/* Sections or items */}
                      {item.featured ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                          {item.sections?.map((section, sectionIndex) => (
                            <div
                              key={`section-${sectionIndex}`}
                              className="flex flex-col min-w-0"
                            >
                              <h3 className="text-[13px] font-semibold text-primary mb-2">
                                {section.title}
                              </h3>
                              <div className="flex flex-col space-y-0.5">
                                {section.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    target={
                                      subItem.href.startsWith("http")
                                        ? "_blank"
                                        : undefined
                                    }
                                    rel={
                                      subItem.href.startsWith("http")
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                    className="block py-1.5 px-2 text-[14px] font-normal text-muted-foreground hover:text-primary hover:bg-muted/30 rounded-lg transition-colors -mx-2"
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block p-2 text-[15px] font-normal text-muted-foreground hover:text-primary hover:bg-muted/30 rounded-lg transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <>
                          {item.sections?.map((section, sectionIndex) => (
                            <div
                              key={`section-${sectionIndex}`}
                              className="flex flex-col min-w-0"
                            >
                              <h3 className="text-sm font-semibold text-primary mb-2">
                                {section.title}
                              </h3>
                              <div className="flex flex-col space-y-0.5">
                                {section.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    target={
                                      subItem.href.startsWith("http")
                                        ? "_blank"
                                        : undefined
                                    }
                                    rel={
                                      subItem.href.startsWith("http")
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                    className="block py-1.5 px-2 text-[14px] font-normal text-muted-foreground hover:text-primary hover:bg-muted/30 rounded-lg transition-colors"
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block py-1.5 px-2 text-[14px] font-normal text-muted-foreground hover:text-primary hover:bg-muted/30 rounded-lg transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink
                  href={item.href}
                  className={cn(
                    "text-[15px] font-semibold text-primary transition-colors hover:text-primary  py-2",
                    isActive(item.href, true) && "underline underline-offset-4",
                  )}
                >
                  {item.label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        {/* Custom right-aligned viewport */}
        <div className="absolute right-0 top-full flex justify-end">
          <NavigationMenuPrimitive.Viewport
            className={cn(
              "origin-top-right relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-white text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
            )}
          />
        </div>
      </NavigationMenuPrimitive.Root>
    </div>
  );
};

export default DesktopNavigation;
