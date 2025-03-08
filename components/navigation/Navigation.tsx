"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Session } from 'next-auth'
import { ChevronDown, ChevronRight, Instagram, Facebook, Linkedin, Phone, Mail, MapPin, Clock, Ship, Calendar, Users2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { ScrollArea } from "@/components/ui/scroll-area"

// Navigation data structure
const navigationData = {
    main: [
        { 
            href: "/term-charter", 
            label: "Term Charter",
            children: [
                { href: "/boats/search", label: "Weekly Charters" },
                { href: "/term-charter/monthly", label: "Monthly Charters" },
                { href: "/term-charter/seasonal", label: "Seasonal Packages" },
                { href: "/term-charter/custom", label: "Custom Duration" },
            ]
        },
        { 
            href: "/our-services", 
            label: "Our Services",
            children: [
                { href: "/services/crew", label: "Crew Services" },
                { href: "/services/catering", label: "Catering" },
                { href: "/services/events", label: "Event Planning" },
                { href: "/services/concierge", label: "Concierge" },
            ]
        },
        { 
            href: "/experiences", 
            label: "Experiences",
            children: [
                { href: "/experiences/luxury-charter", label: "Luxury Yacht Charter" },
                { href: "/experiences/sunset-cruise", label: "Sunset Cruise" },
                { href: "/experiences/bahamas", label: "Bahamas" },
                { type: "header", label: "CELEBRATIONS" },
                { href: "/experiences/bachelor", label: "Bachelor Party" },
                { href: "/experiences/bachelorette", label: "Bachelorette Party" },
                { href: "/experiences/birthday", label: "Birthday Celebration" },
                { href: "/experiences/corporate", label: "Corporate Events" },
                { href: "/experiences/family", label: "Family Outing" },
                { type: "header", label: "ACTIVITIES" },
                { href: "/experiences/sandbar", label: "Sandbar Party" },
                { href: "/experiences/jetski", label: "Jet Ski" },
                { href: "/experiences/watersports", label: "Watersports" },
            ]
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
        { href: "/profile", label: "Dashboard" },
        { href: "/profile/bookings", label: "My Bookings" },
        { href: "/profile/inbox", label: "Inbox" },
        { href: "/profile/favorites", label: "Favorites" },
        { href: "/profile/settings", label: "Settings" },
    ]
}

// Add quick links data near your navigation data
const quickLinks = [
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

const featuredItems = [
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

    // Basic scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        
        handleScroll() // Initial check
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Utility function for user initials
    const getInitials = (name?: string | null, email?: string | null) => {
        if (name) {
            const parts = name.split(' ')
            return parts.length > 1 
                ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
                : name[0].toUpperCase()
        }
        return email?.[0].toUpperCase() ?? '?'
    }

    // Header style
    const headerStyle = cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        isHomePage 
            ? scrolled 
                ? "bg-white backdrop-blur-sm shadow-sm py-3" 
                : "bg-transparent py-5"
            : "bg-white backdrop-blur-sm shadow-sm py-3"
    )

    //MAIN TEXT STYLES
    const getTextStyle = (isActive: boolean = false) => cn(
        "transition-all duration-200",
        "text-[15px] font-medium tracking-wide",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm",
        isActive
            ? "text-primary"
            : isHomePage && !scrolled
                ? "text-white hover:text-white/80"
                : "text-gray-700 hover:text-primary"
    )

    // Animation variants for dropdown
    const dropdownVariants = {
        hidden: { opacity: 0, y: -5 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <header className={headerStyle}>
            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between h-10" role="navigation" aria-label="Main navigation">
                    {/* Left section:Sidebar Menu + Logo */}
                    <div className="flex items-center gap-3">
                        <Sheet modal={false}>
                            <SheetTrigger asChild>
                                <button
                                    className={cn(
                                        "transition-colors px-1 sm:px-1.5", 
                                        "focus:outline-none focus-visible:ring-2",
                                        "focus-visible:ring-primary/50 rounded-sm",
                                        "hover:scale-105 active:scale-95",
                                        isHomePage && !scrolled 
                                            ? "text-white hover:text-white/80" 
                                            : "text-primary hover:text-primary/80"
                                    )}
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
                                                <h3 className="text-xs font-semibold text-gray-400 mb-3 px-1">MAIN MENU</h3>
                                                <div className="space-y-1">
                                                    {navigationData.main.map((item) => (
                                                        <motion.div 
                                                            key={item.href} 
                                                            className="rounded-md overflow-hidden"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {item.children ? (
                                                                <div>
                                                                    <button
                                                                        onClick={() => setExpandedItems(prev => 
                                                                            prev.includes(item.href)
                                                                                ? prev.filter(i => i !== item.href)
                                                                                : [...prev, item.href]
                                                                        )}
                                                                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                                                    >
                                                                        {item.label}
                                                                        <ChevronRight className={cn(
                                                                            "w-4 h-4 text-gray-400 transition-transform",
                                                                            expandedItems.includes(item.href) && "rotate-90"
                                                                        )} />
                                                                    </button>
                                                                    <AnimatePresence>
                                                                        {expandedItems.includes(item.href) && (
                                                                            <motion.div 
                                                                                initial="hidden"
                                                                                animate="visible"
                                                                                exit="hidden"
                                                                                variants={dropdownVariants}
                                                                                className="ml-4 mt-1 space-y-1 border-l-2 border-primary/10 pl-2"
                                                                            >
                                                                                {item.children.map((child, idx) => (
                                                                                    'type' in child ? (
                                                                                        <div 
                                                                                            key={idx}
                                                                                            className="px-3 py-2 text-xs font-semibold text-gray-400"
                                                                                        >
                                                                                            {child.label}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <SheetClose asChild key={child.href}>
                                                                                            <Link
                                                                                                href={child.href}
                                                                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                                                                            >
                                                                                                {child.label}
                                                                                            </Link>
                                                                                        </SheetClose>
                                                                                    )
                                                                                ))}
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            ) : (
                                                                <SheetClose asChild>
                                                                    <Link
                                                                        href={item.href}
                                                                        className="block px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                                                    >
                                                                        {item.label}
                                                                    </Link>
                                                                </SheetClose>
                                                            )}
                                                        </motion.div>
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

                        <Link 
                            href="/" 
                            className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                            aria-label="Home"
                        >
                            <Image 
                                src="/icons/logo.png" 
                                alt="Logo" 
                                width={40} 
                                height={40}
                                className="rounded-full transition-transform hover:scale-105"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Right section: Navigation + Social + User menu */}
                    <div className="flex items-center gap-8">
                        {/* Main Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navigationData.main.map((item) => (
                                <div key={item.href} className="relative group">
                                    {item.children ? (
                                        <>
                                            <button 
                                                className={cn(
                                                    "flex items-center gap-1 group",
                                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm",
                                                    "hover:scale-105 active:scale-95 transition-transform"
                                                )}
                                                aria-expanded={expandedItems.includes(item.href)}
                                            >
                                                <span className={getTextStyle(pathname.startsWith(item.href))}>
                                                    {item.label}
                                                </span>
                                                <ChevronDown className={cn(
                                                    "w-4 h-4 transition-transform duration-300",
                                                    "group-hover:rotate-180",
                                                    isHomePage && !scrolled ? "text-white" : "text-gray-700"
                                                )} />
                                            </button>
                                            <div className={cn(
                                                "absolute top-full left-0 mt-1",
                                                "w-64 p-1",
                                                "invisible group-hover:visible opacity-0 group-hover:opacity-100",
                                                "transition-all duration-200 transform",
                                                "translate-y-2 group-hover:translate-y-0",
                                                "bg-white/95 backdrop-blur-sm rounded-lg",
                                                "shadow-lg border border-gray-100/50",
                                                "divide-y divide-gray-100/50"
                                            )}>
                                                {item.children.map((child, idx) => (
                                                    'type' in child ? (
                                                        <div 
                                                            key={idx}
                                                            className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50"
                                                        >
                                                            {child.label}
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            className={cn(
                                                                "block px-4 py-2 text-sm text-gray-700",
                                                                "hover:bg-gray-50 transition-colors",
                                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
                                                                "first:rounded-t-lg last:rounded-b-lg"
                                                            )}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    )
                                                ))}
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

                        {/* Social Icons */}
                        <div className="hidden md:flex items-center gap-4">
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={cn(
                                    "transition-all duration-200 hover:scale-110",
                                    "focus:outline-none focus-visible:ring-2",
                                    "focus-visible:ring-primary/50 rounded-sm p-1",
                                    "hover:-translate-y-0.5",
                                    isHomePage && !scrolled
                                        ? "text-white hover:text-white/80"
                                        : "text-gray-700 hover:text-primary"
                                )}
                            >
                                <Instagram className="w-5 h-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={cn(
                                    "transition-all duration-200 hover:scale-110",
                                    "focus:outline-none focus-visible:ring-2",
                                    "focus-visible:ring-primary/50 rounded-sm p-1",
                                    "hover:-translate-y-0.5",
                                    isHomePage && !scrolled
                                        ? "text-white hover:text-white/80"
                                        : "text-gray-700 hover:text-primary"
                                )}
                            >
                                <Facebook className="w-5 h-5" />
                                <span className="sr-only">Facebook</span>
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={cn(
                                    "transition-all duration-200 hover:scale-110",
                                    "focus:outline-none focus-visible:ring-2",
                                    "focus-visible:ring-primary/50 rounded-sm p-1",
                                    "hover:-translate-y-0.5",
                                    isHomePage && !scrolled
                                        ? "text-white hover:text-white/80"
                                        : "text-gray-700 hover:text-primary"
                                )}
                            >
                                <Linkedin className="w-5 h-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                        </div>

                        {/* User Menu */}
                        {user ? (
                            <DropdownMenu modal={true}>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className={cn(
                                            "p-0.5 h-10 w-10 sm:h-11 sm:w-11 rounded-full",
                                            "focus-visible:ring-2 focus-visible:ring-offset-2",
                                            "focus:outline-none focus:ring-0 focus:ring-offset-0",
                                            isHomePage && !scrolled
                                                ? "focus-visible:ring-white/80 focus-visible:ring-offset-transparent"
                                                : "focus-visible:ring-primary/50 focus-visible:ring-offset-white",
                                            "transition-all duration-300 hover:scale-105",
                                            "data-[state=open]:bg-transparent",
                                            "[&:not(:focus-visible)]:ring-0 [&:not(:focus-visible)]:ring-offset-0",
                                            "after:hidden"
                                        )}
                                    >
                                        <Avatar className={cn(
                                            "h-full w-full transition-all duration-300",
                                            "ring-[2px] sm:ring-[2.5px]",
                                            isHomePage && !scrolled 
                                                ? "ring-white/90 bg-white/10" 
                                                : "ring-primary/90 bg-primary/5"
                                        )}>
                                            <AvatarImage 
                                                src={user?.profileImage || ''} 
                                                className="object-cover"
                                            />
                                            <AvatarFallback className={cn(
                                                "text-xs sm:text-sm font-semibold",
                                                isHomePage && !scrolled
                                                    ? "bg-white/20 text-white"
                                                    : "bg-primary/10 text-primary"
                                            )}>
                                                {getInitials(user.name, user.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                    align="end" 
                                    sideOffset={8}
                                    className="w-64 p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg"
                                    forceMount
                                    onCloseAutoFocus={(e) => e.preventDefault()}
                                    avoidCollisions={false}
                                    collisionPadding={20}
                                >
                                    <div className="pb-2 border-b border-gray-100/50">
                                        <p className="font-medium text-gray-900 truncate px-2 py-1">
                                            {user.name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate px-2">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="py-2">
                                        {navigationData.user.map((item) => (
                                            <DropdownMenuItem key={item.href} asChild>
                                                <Link 
                                                    href={item.href}
                                                    className="w-full px-2 py-1.5 text-[15px] text-gray-700 rounded-md hover:bg-primary/5 hover:text-primary"
                                                >
                                                    {item.label}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                    <DropdownMenuItem 
                                        onClick={() => signOut()}
                                        className="w-full px-2 py-1.5 mt-2 text-[15px] text-red-600 rounded-md hover:bg-red-50"
                                    >
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.push('/sign-in')}
                                    className={cn(
                                        "text-[15px] font-medium tracking-wide",
                                        "transition-all duration-200",
                                        "focus:outline-none focus-visible:ring-2",
                                        "focus-visible:ring-primary/50 rounded-sm",
                                        "hover:scale-105 active:scale-95",
                                        isHomePage && !scrolled
                                            ? "text-white hover:text-white/80"
                                            : "text-gray-700 hover:text-primary"
                                    )}
                                >
                                    Sign in
                                </button>
                                <button
                                    onClick={() => router.push('/sign-up')}
                                    className={cn(
                                        "text-[15px] font-medium tracking-wide",
                                        "border-2 rounded-md px-4 py-1.5",
                                        "transition-all duration-300",
                                        "focus:outline-none focus-visible:ring-2",
                                        "focus-visible:ring-primary/50",
                                        "hover:scale-105 active:scale-95",
                                        isHomePage && !scrolled
                                            ? "border-white text-white hover:bg-white hover:text-gray-900"
                                            : "border-primary text-primary hover:bg-primary hover:text-white"
                                    )}
                                >
                                    Sign up
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navigation 