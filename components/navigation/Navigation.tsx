"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, throttle } from '@/lib/utils'
import Image from 'next/image'
import { Session } from 'next-auth'
import { Phone, Mail, MapPin, Clock, Ship, Calendar, Users2 } from 'lucide-react'

// Import subcomponents
import MobileNavigation from './sub-components/MobileNavigation'
import DesktopNavigation from './sub-components/DesktopNavigation'
import UserMenu from './sub-components/UserMenu'
import SocialLinks from './sub-components/SocialLinks'

// Import types
import { NavigationItem, QuickLink, FeaturedItem } from '@/types/types'

// Navigation data structure
const navigationData: {
    main: NavigationItem[];
    secondary: NavigationItem[];
    user: NavigationItem[];
} = {
    main: [
        { 
            href: "/explore", 
            label: "Explore",
            children: []
        },
        { href: "/contact", label: "Contact" },
    ],
    secondary: [
        { href: "/about", label: "About Us" },
        { href: "/faq", label: "FAQ" },
        { href: "/yacht-club", label: "KOS Yacht Club" },
        { href: "/careers", label: "Careers" },
        { href: "/press", label: "Press" },
        { href: "/blog", label: "Blog" },
    ],
    user: [
        { href: "/profile", label: "View Profile" },
        { href: "/profile/bookings", label: "My Bookings" },
        { href: "/profile/boats", label: "My Boats" },
        { href: "/profile/favorites", label: "Favorites" },
    ]
}

// Add quick links data near your navigation data
const quickLinks: QuickLink[] = [
    {
        icon: Phone,
        label: "Contact Sales",
        value: "+1 (888) 123-4567",
        href: "tel:+18881234567"
    },
    {
        icon: Mail,
        label: "Email Us",
        value: "charter@kos.com",
        href: "mailto:charter@kos.com"
    },
    {
        icon: MapPin,
        label: "Main Location",
        value: "Miami Beach Marina",
        href: "https://maps.google.com"
    },
    {
        icon: Clock,
        label: "Business Hours",
        value: "9:00 AM - 6:00 PM EST",
        href: "/contact"
    }
]

const featuredItems: FeaturedItem[] = [
    {
        icon: Ship,
        label: "Featured Charter",
        title: "Luxury Weekend Escape",
        desc: "3-day charter in the Bahamas",
        href: "/term-charter/weekly"
    },
    {
        icon: Calendar,
        label: "Upcoming Event",
        title: "Summer Yacht Party",
        desc: "Join us this July",
        href: "/experiences/sandbar"
    },
    {
        icon: Users2,
        label: "Member Benefits",
        title: "KOS Yacht Club",
        desc: "Exclusive perks & privileges",
        href: "/yacht-club"
    }
]

const Navigation = ({ session }: { session: Session | null }) => {
    const pathname = usePathname()
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const user = session?.user
    const isHomePage = pathname === '/'

    // Memoized scroll handler with throttling
    const handleScroll = useCallback(
        throttle(() => {
            setScrolled(window.scrollY > 50)
        }, 100),
        []
    )

    // Basic scroll effect with throttling
    useEffect(() => {
        // Initial check
        handleScroll()
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        
        return () => {
            window.removeEventListener('scroll', handleScroll)
            // Clean up the throttled function to prevent memory leaks
            handleScroll.cancel && handleScroll.cancel()
        }
    }, [handleScroll])

    // Utility function for user initials
    const getInitials = useCallback((name?: string | null, email?: string | null) => {
        if (name) {
            const parts = name.split(' ')
            return parts.length > 1 
                ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
                : name[0].toUpperCase()
        }
        return email?.[0].toUpperCase() ?? '?'
    }, [])

    // Memoized toggle expanded function
    const toggleExpanded = useCallback((href: string) => {
        setExpandedItems(prev => 
            prev.includes(href)
                ? prev.filter(i => i !== href)
                : [...prev, href]
        )
    }, [])

    // Memoized header style
    const headerStyle = useMemo(() => cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        isHomePage 
            ? scrolled 
                ? "bg-white backdrop-blur-sm shadow-sm py-3" 
                : "bg-transparent py-5"
            : "bg-white backdrop-blur-sm shadow-sm py-3"
    ), [isHomePage, scrolled])

    // Memoized text style function
    const getTextStyle = useCallback((isActive: boolean = false) => cn(
        "transition-all duration-200",
        "text-[15px] font-medium tracking-wide",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm",
        isActive
            ? "text-primary"
            : isHomePage && !scrolled
                ? "text-white hover:text-white/80"
                : "text-gray-700 hover:text-primary"
    ), [isHomePage, scrolled])

    return (
        <header className={headerStyle}>
            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between h-10" role="navigation" aria-label="Main navigation">
                    {/* Left section:Sidebar Menu + Logo */}
                    <div className="flex items-center gap-3">
                        <MobileNavigation 
                            navigationData={navigationData}
                            quickLinks={quickLinks}
                            featuredItems={featuredItems}
                            user={user}
                            isHomePage={isHomePage}
                            scrolled={scrolled}
                            expandedItems={expandedItems}
                            setExpandedItems={setExpandedItems}
                        />

                        <Link 
                            href="/" 
                            className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                            aria-label="Home"
                        >
                            <Image 
                                src={scrolled ? "/icons/updatekoslogo-branded.png" : "/icons/kosupdatedlogo.webp"} 
                                alt="Logo" 
                                width={40} 
                                height={40}
                                className={cn(
                                  "rounded-full transition-transform hover:scale-105",
                                  scrolled ? "filter-blue" : ""
                                )}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Right section: Navigation + Social + User menu */}
                    <div className="flex items-center gap-8">
                        {/* Main Navigation */}
                        <DesktopNavigation 
                            navigationData={navigationData}
                            isHomePage={isHomePage}
                            scrolled={scrolled}
                            expandedItems={expandedItems}
                            getTextStyle={getTextStyle}
                        />

                        {/* Social Icons */}
                        <SocialLinks 
                            isHomePage={isHomePage}
                            scrolled={scrolled}
                        />

                        {/* User Menu */}
                        <UserMenu 
                            user={user}
                            navigationData={navigationData}
                            isHomePage={isHomePage}
                            scrolled={scrolled}
                            getInitials={getInitials}
                        />
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navigation 