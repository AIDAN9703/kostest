"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, throttle } from '@/shared/utils/general-utils'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useSearchStore } from '@/features/search/store/useSearchStore'
import { AnimatePresence } from 'framer-motion'

// Import subcomponents
import MobileNavigation from './sub-components/MobileNavigation'
import DesktopNavigation from './sub-components/DesktopNavigation'
import UserMenu from './sub-components/UserMenu'
import SocialLinks from './sub-components/SocialLinks'
import SearchBar from '@/shared/components/layout/sub-components/SearchBar'

// Move navigation data to a separate file
import { navigationData, quickLinks, featuredItems } from '@/shared/constants/navigation-data'

const Navigation = () => {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isLargeScreen, setIsLargeScreen] = useState(true) // Default to true for SSR
    const containerRef = useRef<HTMLElement>(null)
    const user = session?.user
    const isHomePage = pathname === '/'
    const { isExpanded, resetSearchExpansion, clearSearchValue, clearPlaceDetails } = useSearchStore()
    
    // Check if user is an admin
    const isAdmin = user?.role === 'ADMIN'
    
    // Enhanced responsive detection with ResizeObserver
    useEffect(() => {
        const checkWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth
                setIsLargeScreen(width >= 1024) // lg breakpoint (1024px)
            }
        }
        
        // Initial check
        checkWidth()
        
        // Set up ResizeObserver for more accurate responsive detection
        const resizeObserver = new ResizeObserver(checkWidth)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }
        
        return () => {
            resizeObserver.disconnect()
        }
    }, [])
    
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
    
    // Memoized computed values to prevent unnecessary re-renders
    const showSearchInNav = useMemo(() => 
        !isHomePage || (isHomePage && isExpanded),
        [isHomePage, isExpanded]
    )

    // Optimized scroll handler with requestAnimationFrame and throttling
    const handleScroll = useCallback(
        throttle(() => {
            // Use requestAnimationFrame to optimize visual updates
            requestAnimationFrame(() => {
                const scrollPosition = window.scrollY
                const newScrolled = scrollPosition > 50
                // Only update state if it actually changed
                setScrolled(prev => prev !== newScrolled ? newScrolled : prev)
            })
        }, 16), // ~60fps for smoother scrolling
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


    // Memoized header style
    const headerStyle = useMemo(() => cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        isHomePage 
            ? scrolled 
                ? "bg-white backdrop-blur-xs shadow-xs py-3" 
                : "bg-transparent py-5"
            : "bg-white backdrop-blur-xs shadow-xs py-3"
    ), [isHomePage, scrolled])

    // Memoized text style function
    const getTextStyle = useCallback((isActive: boolean = false) => cn(
        "transition-all duration-200",
        "text-[15px] font-semibold tracking-wide",
        "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm",
        isActive
            ? "text-primary"
            : isHomePage && !scrolled
                ? "text-white hover:text-white/80"
                : "text-gray-700 hover:text-primary"
    ), [isHomePage, scrolled])

    // Memoized props for child components to prevent unnecessary re-renders
    const mobileNavProps = useMemo(() => ({
        navigationData,
        quickLinks,
        featuredItems,
        user,
        isHomePage,
        scrolled,
        expandedItems,
        setExpandedItems,
        isAdmin
    }), [user, isHomePage, scrolled, expandedItems, setExpandedItems, isAdmin])

    const desktopNavProps = useMemo(() => ({
        navigationData,
        isHomePage,
        scrolled,
        expandedItems,
        getTextStyle,
        isAdmin
    }), [isHomePage, scrolled, expandedItems, getTextStyle, isAdmin])

    const userMenuProps = useMemo(() => ({
        user,
        navigationData,
        isHomePage,
        scrolled
    }), [user, isHomePage, scrolled])

    const socialLinksProps = useMemo(() => ({
        isHomePage,
        scrolled
    }), [isHomePage, scrolled])

    return (
        <header ref={containerRef} className={headerStyle}>
            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="grid grid-cols-[auto_1fr_auto] items-center h-14 gap-4" role="navigation" aria-label="Main navigation">
                    {/* Left section: Logo + Main Navigation */}
                    <div className="flex items-center gap-3">
                        <MobileNavigation {...mobileNavProps} />

                        <Link 
                            href="/" 
                            className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
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
                        {isLargeScreen && (
                            <DesktopNavigation {...desktopNavProps} />
                        )}

                        <SocialLinks {...socialLinksProps} />

                        <UserMenu {...userMenuProps} />
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navigation 