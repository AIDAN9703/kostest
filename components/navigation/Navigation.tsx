"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, throttle } from '@/lib/utils/general-utils'
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
import { navigationData, quickLinks, featuredItems } from '@/lib/constants/navigation-data'

const Navigation = ({ session }: { session: Session | null }) => {
    const pathname = usePathname()
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const user = session?.user
    const isHomePage = pathname === '/'
    const { isExpanded, resetSearchExpansion, clearSearchValue, clearPlaceDetails } = useSearchStore()
    
    // Check if user is an admin
    const isAdmin = user?.role === 'ADMIN'
    
    // Reset the isExpanded state when navigating to the home page
    useEffect(() => {
        if (isHomePage) {
            resetSearchExpansion()
        }
        
        // Clear search values when not on search page
        if (!pathname.includes('/boats/search')) {
            clearSearchValue()
            clearPlaceDetails()
        }
    }, [isHomePage, resetSearchExpansion, pathname, clearSearchValue, clearPlaceDetails])
    
    // Show search bar in nav on non-home pages or when scrolled past the hero section searchbar
    const showSearchInNav = !isHomePage || (isHomePage && isExpanded)

    // More responsive throttled scroll handler (50ms instead of 100ms)
    const handleScroll = useCallback(
        throttle(() => {
            // Use requestAnimationFrame to optimize visual updates
            requestAnimationFrame(() => {
                const scrollPosition = window.scrollY
                setScrolled(scrollPosition > 50)
            })
        }, 50),
        []
    )

    // Improved scroll effect with passive event listener
    useEffect(() => {
        // Execute once on mount
        handleScroll()
        
        // Add event listener with passive option for performance
        window.addEventListener('scroll', handleScroll, { passive: true })
        
        // Cleanup function
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (handleScroll.cancel) {
                handleScroll.cancel()
            }
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
                ? "bg-white backdrop-blur-sm shadow-md py-3" 
                : "bg-transparent py-5"
            : "bg-white backdrop-blur-sm shadow-md py-3"
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
                <nav className="grid grid-cols-[auto_1fr_auto] items-center h-14 gap-4" role="navigation" aria-label="Main navigation">
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
                            isAdmin={isAdmin}
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
                            {showSearchInNav && (
                                <div className="animate-fadeIn w-full max-w-[400px]">
                                    <SearchBar variant="nav" />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right section: Navigation + Social + User menu */}
                    <div className="flex items-center gap-4">
                        <DesktopNavigation 
                            navigationData={navigationData}
                            isHomePage={isHomePage}
                            scrolled={scrolled}
                            expandedItems={expandedItems}
                            getTextStyle={getTextStyle}
                            isAdmin={isAdmin}
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