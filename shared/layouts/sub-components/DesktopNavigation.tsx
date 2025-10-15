"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/general-utils";
import { ChevronDown, Crown } from "lucide-react";
import { SimpleNavItem } from "@/shared/constants/navigation-data";

interface DesktopNavigationProps {
  navigationData: {
    main: SimpleNavItem[];
  };
  expandedItems: string[];
  isAdmin?: boolean;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navigationData,
  expandedItems,
  isAdmin = false,
}) => {
  const pathname = usePathname();

  // Ultra-simple styling - just a few base classes
  const baseClasses = {
    nav: "hidden lg:flex items-center gap-4",
    crown: "p-1.5 rounded-full hover:bg-primary/5 transition-colors mr-3",
    item: "relative group",
    link: "text-[15px] font-semibold font-poppins tracking-wide transition-colors hover:text-primary",
    linkActive: "text-primary",
    linkInactive: "text-gray-700",
    button:
      "flex items-center gap-1 group transition-transform hover:scale-105",
    chevron:
      "w-4 h-4 transition-transform group-hover:rotate-180 text-gray-700",
    dropdown:
      "absolute top-full right-[-160px] mt-2 w-[800px] max-w-[90vw] p-6 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white rounded-lg shadow-xl grid grid-cols-3 gap-x-8 gap-y-6 z-50",
    dropdownSection: "flex flex-col",
    dropdownTitle: "text-lg font-bold text-[#1E293B] mb-2",
    dropdownItems: "flex flex-col space-y-1",
    dropdownItem:
      "block py-2 text-sm text-gray-600 hover:text-primary transition-colors",
  };

  return (
    <div className={baseClasses.nav}>
      {/* Admin crown */}
      {isAdmin && (
        <Link
          href="/admin"
          className={baseClasses.crown}
          title="Admin Dashboard"
        >
          <Crown className="w-5 h-5 text-primary hover:scale-110 transition-transform" />
        </Link>
      )}

      {/* Navigation items */}
      {navigationData.main.map((item) => (
        <div key={item.href} className={baseClasses.item}>
          {item.type === "dropdown" && (item.items || item.sections) ? (
            <>
              <button className={baseClasses.button}>
                <span
                  className={cn(
                    baseClasses.link,
                    pathname.startsWith(item.href)
                      ? baseClasses.linkActive
                      : baseClasses.linkInactive
                  )}
                >
                  {item.label}
                </span>
                <ChevronDown className={baseClasses.chevron} />
              </button>
              <div className={baseClasses.dropdown}>
                {item.sections
                  ? // Render with sections (organized dropdown)
                    item.sections.map((section, sectionIndex) => (
                      <div
                        key={`section-${sectionIndex}`}
                        className={baseClasses.dropdownSection}
                      >
                        <h3 className={baseClasses.dropdownTitle}>
                          {section.title}
                        </h3>
                        <div className={baseClasses.dropdownItems}>
                          {section.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={baseClasses.dropdownItem}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                  : // Render flat items (simple dropdown)
                    item.items?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={baseClasses.dropdownItem}
                      >
                        {subItem.label}
                      </Link>
                    ))}
              </div>
            </>
          ) : (
            <Link
              href={item.href}
              className={cn(
                baseClasses.link,
                pathname === item.href
                  ? baseClasses.linkActive
                  : baseClasses.linkInactive
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(DesktopNavigation);
