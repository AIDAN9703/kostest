"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, throttle } from '@/lib/utils'
import Image from 'next/image'
import { Session } from 'next-auth'
import { useSearchStore } from '@/store/useSearchStore'
import { AnimatePresence } from 'framer-motion'

// Import subcomponents
import MobileNavigation from './sub-components/MobileNavigation'
import DesktopNavigation from './sub-components/DesktopNavigation'
import UserMenu from './sub-components/UserMenu'
import SocialLinks from './sub-components/SocialLinks'
import SearchBar from '@/components/navigation/sub-components/SearchBar'

// Move navigation data to a separate file
import { navigationData, quickLinks, featuredItems } from '@/constants/navigation-data'

const Navigation = ({ session }: { session: Session | null }) => {
    const pathname = usePathname()
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const user = session?.user
    const isHomePage = pathname === '/'
    const { isExpanded } = useSearchStore()

    // Memoized scroll handler with throttling
    const handleScroll = useCallback(
        throttle(() => {
            setScrolled(window.scrollY > 50)
        }, 100),
        []
    )

    // Basic scroll effect with throttling
    useEffect(() => {
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
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
                <nav className="grid grid-cols-[auto_1fr_auto] items-center h-10 gap-4" role="navigation" aria-label="Main navigation">
                    {/* Left section: Logo + Main Navigation */}
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
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                            aria-label="Home"
                        >
                            <Image 
                                src={isHomePage 
                                    ? (scrolled ? "/icons/updatekoslogo-branded.png" : "/icons/kosupdatedlogo.webp")
                                    : "/icons/updatekoslogo-branded.png"
                                } 
                                alt="Logo" 
                                width={40} 
                                height={40}
                                className={cn(
                                  "rounded-full transition-transform hover:scale-105",
                                  (!isHomePage || scrolled) ? "filter-blue" : ""
                                )}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Center section: Search Bar */}
                    <div className="flex justify-center">
                        <AnimatePresence>
                            {isExpanded && (
                                <SearchBar variant="nav" />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right section: Navigation + Social + User menu */}
                    <div className="flex items-center gap-8">
                        <DesktopNavigation 
                            navigationData={navigationData}
                            isHomePage={isHomePage}
                            scrolled={scrolled}
                            expandedItems={expandedItems}
                            getTextStyle={getTextStyle}
                        />

                        <SocialLinks 
                            isHomePage={isHomePage}
                            scrolled={scrolled}
                        />

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