"use client";

import React from "react";
import Link from "next/link";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cn } from "@/shared/lib/utils/general-utils";
import { Crown } from "lucide-react";
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
    <div className="hidden lg:flex items-center gap-5">
      {isAdmin && (
        <Link
          href="/admin"
          className="p-1.5 rounded-full hover:bg-primary/5 transition-colors"
          title="Admin Dashboard"
        >
          <Crown className="w-5 h-5 text-primary transition-transform" />
        </Link>
      )}

      <NavigationMenuPrimitive.Root className="relative z-10 flex max-w-max flex-1 items-center justify-center">
        <NavigationMenuList className="gap-2">
          {navigationData.main.map((item) => (
            <NavigationMenuItem key={item.href} className="relative">
              {item.type === "dropdown" && (item.items || item.sections) ? (
                <>
                  <NavigationMenuTrigger className="text-base font-semibold text-primary data-[state=open]:bg-transparent data-[active]:bg-transparent hover:bg-transparent focus:bg-transparent h-auto py-0 px-0 bg-transparent">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="right-0 left-auto">
                    <div
                      style={{ width: 800, maxWidth: "95vw" }}
                      className="p-5 bg-white rounded-xl shadow-xl border border-border/60 grid grid-cols-4 gap-x-2 gap-y-4"
                    >
                      {item.sections?.map((section, sectionIndex) => (
                        <div key={`section-${sectionIndex}`} className="flex flex-col min-w-0">
                          <h3 className="text-sm font-semibold text-primary mb-2 leading-snug sm:text-base">
                            {section.title}
                          </h3>
                          <div className="flex flex-col space-y-0.5">
                            {section.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                target={subItem.href.startsWith("http") ? "_blank" : undefined}
                                rel={
                                  subItem.href.startsWith("http")
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                className="block py-2 px-2 text-sm leading-snug font-normal text-muted-foreground hover:text-primary hover:bg-muted/75 rounded-lg transition-colors whitespace-nowrap sm:text-[15px] sm:leading-5"
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
                          className="block py-2 px-2 -mx-2 text-sm leading-snug font-normal text-muted-foreground hover:text-primary hover:bg-muted/30 rounded-lg transition-colors whitespace-nowrap sm:text-[15px] sm:leading-5"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink
                  href={item.href}
                  className={cn(
                    "text-base font-semibold text-primary transition-colors hover:text-primary py-2",
                    isActive(item.href, true) && "underline underline-offset-4"
                  )}
                >
                  {item.label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        {/* No Viewport — content renders in-place inside NavigationMenuItem,
            positioned via md:absolute from NavigationMenuContent base styles.
            This avoids the overflow-hidden + CSS variable measurement cycle
            that was forcing the dropdown to collapse at any width other than 1024px. */}
      </NavigationMenuPrimitive.Root>
    </div>
  );
};

export default DesktopNavigation;
