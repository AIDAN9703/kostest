"use client"

import React, { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/shared/utils/general-utils'
import { Button } from '@/shared/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetClose,
} from "@/shared/components/ui/sheet"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { ChevronRight, ChevronUp, ChevronDown, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Session } from 'next-auth'
import { signOut } from "next-auth/react"

// Import the navigation data types
import { NavigationItem, QuickLink, FeaturedItem, HeaderItem } from '@/shared/types/types'

// Define the dropdown menu data structure for mobile
const mobileDropdownMenus = {
  explore: {
    columns: [
      {
        title: "Experiences",
        links: [
          { href: "/boats/search", label: "All boats" },
          { href: "/experiences/term-charters", label: "Term Charters" },
          { href: "/experiences/fishing", label: "Fishing" },
          { href: "/experiences/watersports", label: "Water Sports" },
          { href: "/experiences/sand-bar", label: "Sand Bar" },
          { href: "/experiences/special-events", label: "Special Events" },
          { href: "/experiences", label: "All Experiences" },
        ]
      },
      {
        title: "Locations",
        links: [
            { href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=25.85578602396197&ne_lng=-80.13217904641093&sw_lat=25.7090419531335&sw_lng=-80.31860792381018&zoom_level=13&map_toggle=on", label: "Miami" },
            { href: "/boats/search?near=Fort+Lauderdale%2C+FL%2C+USA&ne_lat=26.3409054020211&ne_lng=-79.96155203202743&sw_lat=25.843256360518946&sw_lng=-80.29869497636336&zoom_level=11&map_toggle=on&center_lat=26.092345480536487&center_lng=-80.1301235041954&page=1", label: "Fort Lauderdale" },
            { href: "/boats/search?near=Naples%2C+FL%2C+USA&ne_lat=26.2112380492215&ne_lng=-81.766661003186&sw_lat=26.07891108467754&sw_lng=-81.82036397203399&zoom_level=13&map_toggle=on", label: "Naples" },
            { href: "/boats/search?near=West+Palm+Beach%2C+FL%2C+USA&ne_lat=27.22490351163897&ne_lng=-79.80718021289641&sw_lat=26.235107843921803&sw_lng=-80.48146610156829&zoom_level=10&map_toggle=on&center_lat=26.73108210125018&center_lng=-80.14432315723235&page=1", label: "West Palm Beach" },
            { href: "/boats/search?near=Connecticut%2C+USA&ne_lat=42.05051096606773&ne_lng=-71.78723902917415&sw_lat=40.95094295977581&sw_lng=-73.7277749818916&zoom_level=13&map_toggle=on", label: "Connecticut" },
            { href: "/boats/search?near=The+Bahamas&ne_lat=26.590274469914576&ne_lng=-76.65761869261429&sw_lat=22.560024925745196&sw_lng=-79.35476224730179&zoom_level=8&map_toggle=on&center_lat=24.591364629076335&center_lng=-78.00619046995804&page=1", label: "Bahamas" },
            { href: "/boats/search?near=Dominican+Republic&ne_lat=27.00077435235987&ne_lng=-65.31237564053237&sw_lat=10.272085808139986&sw_lng=-76.10094985928237&zoom_level=6&map_toggle=on&center_lat=18.844302328127366&center_lng=-70.70666274990737&page=1", label: "Dominican Republic" }
        ]
      },
      {
        title: "Our Services",
        links: [
          { href: "/services/charter-management", label: "Charter Managment" },
          { href: "/services/yacht-management", label: "Yacht Management" },
          { href: "/services/sales", label: "Sales/Purchase" },
          { href: "/services/term-charters", label: "Term Charters" },
          { href: "/services/dock-management", label: "Dock Management" },
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

interface MobileNavigationProps {
    navigationData: {
        main: NavigationItem[];
        secondary: NavigationItem[];
        user: NavigationItem[];
    };
    quickLinks: QuickLink[];
    featuredItems: FeaturedItem[];
    user: Session['user'] | undefined | null;
    isHomePage: boolean;
    scrolled: boolean;
    expandedItems: string[];
    setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
    isAdmin?: boolean;
}

// Animation variants for dropdown
const dropdownVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0 }
};

const MobileNavigation: React.FC<MobileNavigationProps> = ({
    navigationData,
    quickLinks,
    featuredItems,
    user,
    isHomePage,
    scrolled,
    expandedItems,
    setExpandedItems,
    isAdmin = false
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Memoized toggle expanded function
    const toggleExpanded = useCallback((href: string) => {
        setExpandedItems(prev => 
            prev.includes(href)
                ? prev.filter(i => i !== href)
                : [...prev, href]
        )
    }, [setExpandedItems]);

    // Memoized hamburger button style
    const hamburgerButtonStyle = useMemo(() => cn(
        "transition-colors px-1 sm:px-1.5", 
        "focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/50 rounded-sm",
        "hover:scale-105 active:scale-95",
        isHomePage && !scrolled 
            ? "text-white hover:text-white/80" 
            : "text-primary hover:text-primary/80"
    ), [isHomePage, scrolled]);

    // Admin crown style
    const crownStyle = useMemo(() => cn(
        "w-5 h-5",
        "text-white",
    ), []);

    return (
        <Sheet modal={false}>
            <SheetTrigger asChild>
                <button
                    className={hamburgerButtonStyle}
                    aria-label="Open menu"
                >
                    <svg 
                        width="32" 
                        height="32" 
                        viewBox="0 0 32 32" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current sm:w-8 sm:h-8 w-7 h-7" 
                        strokeWidth="2"
                    >
                        <line x1="3" y1="8" x2="29" y2="8" />
                        <line x1="3" y1="16" x2="29" y2="16" />
                        <line x1="3" y1="24" x2="29" y2="24" />
                    </svg>
                </button>
            </SheetTrigger>
            <SheetContent 
                side="left" 
                className="w-[340px] p-0 border-r"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                    {/* sidebar menu header */}
                    <div className="p-4 border-b">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Image 
                                    src="/icons/logo.png" 
                                    alt="Logo" 
                                    width={42} 
                                    height={42}
                                    className="rounded-full"
                                    priority
                                />
                            </div>
                            {user ? (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            ) : (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-primary">Welcome to KOS</p>
                                </div>
                            )}
                            {/* Add admin icon link in the header */}
                            {isAdmin && (
                                <SheetClose asChild>
                                    <Link
                                        href="/admin"
                                        className="p-1.5 rounded-full hover:bg-primary/10"
                                        title="Admin Dashboard"
                                        aria-label="Admin Dashboard"
                                    >
                                        <Crown className={crownStyle} />
                                    </Link>
                                </SheetClose>
                            )}
                        </div>
                    </div>

                    {/* sidebar menu content */}
                    <ScrollArea className="flex-1">
                        <div className="px-4 py-6">
                            {/* Main Navigation */}
                            <div className="mb-8">
                                <h3 className="text-xs font-semibold text-gray-400 mb-3 px-1">NAVIGATION</h3>
                                <div className="space-y-1">
                                    {navigationData.main.map((item) => (
                                        <div key={item.href} className="rounded-md overflow-hidden">
                                            {item.children ? (
                                                <div>
                                                    <button
                                                        onClick={() => toggleExpanded(item.href)}
                                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                                                    >
                                                        <div className="flex items-center">
                                                            <span>{item.label}</span>
                                                        </div>
                                                        {expandedItems.includes(item.href) ? (
                                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-gray-400" />
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
                                                                    {item.href === "/explore" ? (
                                                                        mobileDropdownMenus.explore.columns.map((column, columnIndex) => (
                                                                            <div key={`column-${columnIndex}`} className="mb-4">
                                                                                <div className="px-2 py-2 text-xs font-semibold text-gray-500 mt-3 mb-1">
                                                                                    {column.title.toUpperCase()}
                                                                                </div>
                                                                                {column.links.map((link, linkIndex) => (
                                                                                    <SheetClose asChild key={`link-${columnIndex}-${linkIndex}`}>
                                                                                        <Link
                                                                                            href={link.href}
                                                                                            className={cn(
                                                                                                "block px-2 py-1.5 text-sm rounded-md",
                                                                                                pathname === link.href
                                                                                                    ? "text-primary font-medium"
                                                                                                    : "text-gray-700 hover:text-primary"
                                                                                            )}
                                                                                        >
                                                                                            {link.label}
                                                                                        </Link>
                                                                                    </SheetClose>
                                                                                ))}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        item.children.map((child, index) => (
                                                                            'type' in child && child.type === 'header' ? (
                                                                                <div 
                                                                                    key={`header-${index}`}
                                                                                    className="px-2 py-2 text-xs font-semibold text-gray-500 mt-3 mb-1"
                                                                                >
                                                                                    {child.label}
                                                                                </div>
                                                                            ) : (
                                                                                <SheetClose asChild>
                                                                                    <Link
                                                                                        key={'href' in child ? child.href : `item-${index}`}
                                                                                        href={'href' in child ? child.href : '#'}
                                                                                        className={cn(
                                                                                            "block px-2 py-1.5 text-sm rounded-md",
                                                                                            pathname === ('href' in child ? child.href : '')
                                                                                                ? "text-primary font-medium"
                                                                                                : "text-gray-700 hover:text-primary"
                                                                                        )}
                                                                                    >
                                                                                        {child.label}
                                                                                    </Link>
                                                                                </SheetClose>
                                                                            )
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ) : (
                                                <SheetClose asChild>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "block px-3 py-2 text-sm rounded-md",
                                                            pathname === item.href
                                                                ? "text-primary font-medium"
                                                                : "text-gray-700 hover:text-primary hover:bg-primary/5"
                                                        )}
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
                                <h3 className="text-xs font-semibold text-gray-400 mb-3 px-1">MORE</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {navigationData.secondary.map((item) => (
                                        <SheetClose asChild key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                            >
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Contact Links */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 mb-3 px-1">QUICK LINKS</h3>
                                <div className="space-y-2">
                                    {quickLinks.map((item) => (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700">{item.label}</div>
                                                <div className="text-xs text-gray-500">{item.value}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </ScrollArea>

                    {/* sidebar menu footer */}
                    <div className="border-t p-4">
                        {user ? (
                            <Button 
                                onClick={() => signOut()}
                                variant="outline"
                                className="w-full focus:ring-2 focus:ring-primary/50"
                            >
                                Sign out
                            </Button>
                        ) : (
                            <SheetClose asChild>
                                <Button 
                                    onClick={() => router.push('/sign-in')}
                                    className="w-full bg-primary hover:bg-primary/90 text-white"
                                >
                                    Sign In
                                </Button>
                            </SheetClose>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MobileNavigation 