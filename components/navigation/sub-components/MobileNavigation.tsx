"use client"

import React, { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Session } from 'next-auth'
import { signOut } from "next-auth/react"

// Import the navigation data types
import { NavigationItem, QuickLink, FeaturedItem, HeaderItem } from '@/types/types'

// Define the dropdown menu data structure for mobile
const mobileDropdownMenus = {
  explore: {
    columns: [
      {
        title: "Experiences",
        links: [
          { href: "/boats/search", label: "All boats" },
          { href: "/boats/yachts", label: "Yachts" },
          { href: "/boats/fishing", label: "Fishing boats" },
          { href: "/boats/party", label: "Party boats" },
          { href: "/boats/pontoon", label: "Pontoon boats" },
          { href: "/boats/sailboats", label: "Sailboats" },
          { href: "/boats/jetski", label: "Jet Skis" },
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
          { href: "/locations/puerto-rico", label: "Puerto Rico" },
          { href: "/locations/dominican-republic", label: "Dominican Republic" },
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
          { href: "/services/crew-management", label: "Crew Management" },
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
    setExpandedItems
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
                    <div className="p-4 border-b bg-primary/5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Image 
                                    src="/icons/logo.png" 
                                    alt="Logo" 
                                    width={40} 
                                    height={40}
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
                                    <p className="text-xs text-gray-500">Luxury yacht services</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* sidebar menu content */}
                    <ScrollArea className="flex-1">
                        <div className="px-2 py-4">
                            {/* Quick Contact Links */}
                            <div className="px-2 mb-6">
                                <h3 className="text-xs font-semibold text-gray-400 mb-3 px-1">QUICK LINKS</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickLinks.map((item) => (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            className="flex flex-col gap-1 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 text-primary">
                                                <item.icon className="w-4 h-4" />
                                                <span className="text-xs font-medium">{item.label}</span>
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium truncate">
                                                {item.value}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Items */}
                            <div className="px-2 mb-6">
                                <h3 className="text-xs font-semibold text-gray-400 mb-3 px-1">FEATURED</h3>
                                <div className="space-y-2">
                                    {featuredItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-primary font-medium">{item.label}</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Main Navigation */}
                            <div className="px-2 mb-6">
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
                                                        <span>{item.label}</span>
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
                            <div className="px-2">
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
                        </div>
                    </ScrollArea>

                    {/* sidebar menu footer */}
                    <div className="border-t p-4 bg-gray-50/50">
                        {user ? (
                            <Button 
                                onClick={() => signOut()}
                                variant="outline"
                                className="w-full focus:ring-2 focus:ring-primary/50"
                            >
                                Sign out
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <SheetClose asChild>
                                    <Button 
                                        onClick={() => router.push('/sign-in')}
                                        variant="outline"
                                        className="w-full focus:ring-2 focus:ring-primary/50"
                                    >
                                        Sign in
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button 
                                        onClick={() => router.push('/sign-up')}
                                        className="w-full focus:ring-2 focus:ring-primary/50"
                                    >
                                        Sign up
                                    </Button>
                                </SheetClose>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MobileNavigation 