"use client"

import React, { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/general-utils'
import { ChevronDown, Crown } from 'lucide-react'
import { Session } from 'next-auth'
import { NavigationItem, HeaderItem } from '@/lib/types/types'

// Define the dropdown menu data structure
const dropdownMenus = {
  explore: {
    columns: [
      {
        title: "Experiences",
        links: [
          { href: "/boats/search", label: "All Boats" },
          { href: "/boats/yachts", label: "All Yachts" },
          { href: "/experiences/term-charters", label: "Term Charters" },
          { href: "/experiences/fishing", label: "Fishing" },
          { href: "/experiences/watersports", label: "Water Sports" },
          { href: "/experiences/sand-bar", label: "Sand Bar" },
          { href: "/experiences/celebrations", label: "Celebrations" },
          { href: "/experiences", label: "All Experiences" }
        ]
      },
      {
        title: "Locations",
        links: [
          { href: "/locations/miami", label: "Miami" },
          { href: "/locations/fort-lauderdale", label: "Fort Lauderdale" },
          { href: "/locations/naples", label: "Naples" },
          { href: "/locations/west-palm-beach", label: "West Palm Beach" },
          { href: "/locations/connecticut", label: "Connecticut" },
          { href: "/locations/bahamas", label: "Bahamas" },
          { href: "/locations/dominican-republic", label: "Dominican Republic" }
        ]
      },
      {
        title: "Our Services",
        links: [
          { href: "/services/charter-management", label: "Charter Managment" },
          { href: "/services/yacht-management", label: "Yacht Management" },
          { href: "/services/sales", label: "Sales/Purchase" },
          { href: "/services/term-charters", label: "Term Charters" },
          { href: "/services/dock-management", label: "Dock Management" }
        ]
      }
    ]
  },
  charters: {
    columns: [
      {
        title: "Boat charters",
        links: [
          { href: "/charters/luxury", label: "Luxury yachts" },
          { href: "/charters/fishing", label: "Fishing" },
        ]
      }
    ]
  }
};

interface DesktopNavigationProps {
    navigationData: {
        main: NavigationItem[];
    };
    isHomePage: boolean;
    scrolled: boolean;
    expandedItems: string[];
    getTextStyle: (isActive: boolean) => string;
    isAdmin?: boolean;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
    navigationData,
    isHomePage,
    scrolled,
    expandedItems,
    getTextStyle,
    isAdmin = false
}) => {
    const pathname = usePathname();

    // Memoized button style
    const buttonStyle = useMemo(() => cn(
        "flex items-center gap-1 group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm",
        "hover:scale-105 active:scale-95 transition-transform"
    ), []);

    // Memoized dropdown style
    const dropdownStyle = useMemo(() => cn(
        "absolute top-full right-[-160px] mt-2",
        "w-[800px] max-w-[90vw] p-6",
        "invisible group-hover:visible opacity-0 group-hover:opacity-100",
        "transition-all duration-300 transform",
        "translate-y-2 group-hover:translate-y-0",
        "bg-white rounded-lg",
        "shadow-xl",
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6",
        "z-50"
    ), []);

    // Memoized dropdown column title style
    const columnTitleStyle = useMemo(() => cn(
        "text-lg font-medium text-[#1E293B] mb-4"
    ), []);

    // Memoized dropdown item style
    const dropdownItemStyle = useMemo(() => cn(
        "block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
    ), []);

    // Memoized chevron style
    const getChevronStyle = useMemo(() => cn(
        "w-4 h-4 transition-transform duration-300",
        "group-hover:rotate-180",
        isHomePage && !scrolled ? "text-white" : "text-gray-700"
    ), [isHomePage, scrolled]);

    // Admin crown style
    const crownStyle = useMemo(() => cn(
        "w-5 h-5",
        "transition-all duration-200",
        "hover:scale-110",
        isHomePage && !scrolled ? "text-white" : "text-primary"
    ), [isHomePage, scrolled]);

    // Admin crown link/button style
    const crownLinkStyle = useMemo(() => cn(
        "p-1.5 rounded-full",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "hover:bg-primary/5",
        "flex items-center justify-center",
        "mr-3"
    ), []);

    return (
        <div className="hidden lg:flex items-center gap-4">
            {/* Admin crown icon - only shown for admins */}
            {isAdmin && (
                <Link 
                    href="/admin" 
                    className={crownLinkStyle} 
                    title="Admin Dashboard"
                    aria-label="Admin Dashboard"
                >
                    <Crown className={crownStyle} />
                </Link>
            )}
            
            {navigationData.main.map((item) => (
                <div key={item.href} className="relative group">
                    {item.href === "/explore" ? (
                        <>
                            <button 
                                className={buttonStyle}
                                aria-expanded={expandedItems.includes(item.href)}
                            >
                                <span className={getTextStyle(pathname.startsWith(item.href))}>
                                    {item.label}
                                </span>
                                <ChevronDown className={getChevronStyle} />
                            </button>
                            <div className={dropdownStyle}>
                                {dropdownMenus.explore.columns.map((column, columnIndex) => (
                                    <div key={`column-${columnIndex}`} className="flex flex-col">
                                        <h3 className={columnTitleStyle}>{column.title}</h3>
                                        <div className="flex flex-col space-y-1">
                                            {column.links.map((link, linkIndex) => (
                                                <Link
                                                    key={`link-${columnIndex}-${linkIndex}`}
                                                    href={link.href}
                                                    className={dropdownItemStyle}
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : item.children ? (
                        <>
                            <button 
                                className={buttonStyle}
                                aria-expanded={expandedItems.includes(item.href)}
                            >
                                <span className={getTextStyle(pathname.startsWith(item.href))}>
                                    {item.label}
                                </span>
                                <ChevronDown className={getChevronStyle} />
                            </button>
                            <div className={cn(dropdownStyle, "w-[300px] grid-cols-1")}>
                                <div className="flex flex-col">
                                    {item.children.map((child, index) => (
                                        'type' in child && child.type === 'header' ? (
                                            <h3 key={`header-${index}`} className={columnTitleStyle}>
                                                {child.label}
                                            </h3>
                                        ) : (
                                            <Link
                                                key={'href' in child ? child.href : `item-${index}`}
                                                href={'href' in child ? child.href : '#'}
                                                className={dropdownItemStyle}
                                            >
                                                {child.label}
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <Link 
                            href={item.href}
                            className={getTextStyle(pathname === item.href)}
                        >
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </div>
    )
}

export default DesktopNavigation 