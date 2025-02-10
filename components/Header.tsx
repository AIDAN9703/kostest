"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Session } from 'next-auth';

const Header = ({session}: {session: Session | null}) => {
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const user = session?.user;

    // Function to get user initials
    const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
        if (name) {
            // Split name and get initials for first and last name
            const nameParts = name.split(' ');
            if (nameParts.length >= 2) {
                return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
            }
            return name[0].toUpperCase();
        }
        // Fallback to email initial if no name
        return email?.[0].toUpperCase() || '?';
    };

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { href: "/term-charter", label: "Term Charter" },
        { href: "/our-services", label: "Our Services" },
        { href: "/experiences", label: "Experiences" },
        { href: "/contact", label: "Contact" },
    ];

    // Add user-specific nav items when signed in
    const userNavItems = user ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/bookings", label: "My Bookings" },
        { href: "/profile", label: "Profile" },
    ] : [];

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-white backdrop-blur-md py-4 shadow-md" : "bg-transparent py-6"
        )}>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link href="/" className="relative z-10 flex items-center gap-3">
                        <Image 
                            src="/icons/logo.png" 
                            alt="Logo" 
                            width={40} 
                            height={40} 
                            className="transition-transform duration-300 hover:scale-110" 
                        />
                        <span className={cn(
                            "text-xl font-semibold transition-colors duration-300",
                            scrolled ? "text-gray-900" : "text-white"
                        )}>
                            KOSyachts
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:block">
                        <ul className="flex items-center gap-8">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link 
                                        href={item.href}
                                        className={cn(
                                            "text-base font-medium transition-colors duration-300 hover:text-primary", 
                                            pathname === item.href ? "text-gold" : scrolled ? "text-gray-900" : "text-white"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="-ml-4">
                                {user ? (
                                    <div className="flex items-center gap-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className={cn(
                                                    "relative h-10 w-10 rounded-full focus-visible:ring-offset-0 focus-visible:ring-0 hover:bg-transparent p-0",
                                                )}>
                                                    <Avatar className={cn(
                                                        "border-2 border-transparent ring-1 transition-colors",
                                                        scrolled 
                                                            ? "ring-black/20 hover:ring-black/30" 
                                                            : "ring-white/50 hover:ring-white/75"
                                                    )}>
                                                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                                                        <AvatarFallback className={cn(
                                                            "font-medium text-sm",
                                                            scrolled ? "bg-primary/10 text-primary" : "bg-white/10 text-white"
                                                        )}>
                                                            {getInitials(user.name, user.email)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <div className="flex items-center justify-start gap-2 p-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                                            {getInitials(user.name, user.email)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col space-y-1 leading-none">
                                                        {user.name && <p className="font-medium">{user.name}</p>}
                                                        {user.email && (
                                                            <p className="w-[200px] truncate text-sm text-gray-600">
                                                                {user.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {userNavItems.map((item) => (
                                                    <DropdownMenuItem key={item.href} asChild>
                                                        <Link href={item.href}>{item.label}</Link>
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuItem asChild>
                                                    <Button 
                                                        onClick={() => signOut()}
                                                        variant="ghost"
                                                        className="w-full text-base font-medium text-gray-900 hover:text-gold"
                                                    >
                                                        Sign Out
                                                    </Button>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ) : (
                                    <ul className="flex items-center gap-1">
                                        <li>
                                            <Button 
                                                onClick={() => router.push('/sign-in')}
                                                variant="ghost"
                                                className={cn(
                                                    "text-base font-medium transition-all duration-300",
                                                    scrolled 
                                                        ? "text-gray-900 hover:text-primary" 
                                                        : "text-white hover:text-primary",
                                                    "h-auto px-4 py-2 hover:bg-transparent"
                                                )}
                                            >
                                                Sign In
                                            </Button>
                                        </li>
                                        <li>
                                            <Button 
                                                onClick={() => router.push('/sign-up')}
                                                variant="ghost"
                                                className={cn(
                                                    "text-base font-medium transition-all duration-300",
                                                    "border-2 rounded-md",
                                                    scrolled 
                                                        ? "border-primary text-primary hover:bg-primary hover:text-white" 
                                                        : "border-white text-white hover:bg-primary hover:text-white hover:border-primary",
                                                    "h-auto px-4 py-2"
                                                )}
                                            >
                                                Sign Up
                                            </Button>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </nav>

                    {/* Mobile Navigation */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                className={cn(
                                    "lg:hidden transition-colors px-2",
                                    scrolled 
                                        ? "text-gray-900 hover:text-primary" 
                                        : "text-white hover:text-white/80"
                                )}
                                aria-label="Open menu"
                            >
                                <svg 
                                    width="32" 
                                    height="32" 
                                    viewBox="0 0 32 32" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-current"
                                    strokeWidth="2"
                                >
                                    <line x1="3" y1="8" x2="29" y2="8" />
                                    <line x1="3" y1="16" x2="29" y2="16" />
                                    <line x1="3" y1="24" x2="29" y2="24" />
                                </svg>
                            </button>
                        </SheetTrigger>
                        <SheetContent 
                            side="right" 
                            className="w-full sm:max-w-sm bg-white border-none p-0 [&>button]:sheet-close-button"
                        >
                            <SheetTitle className="sr-only">
                                Navigation Menu
                            </SheetTitle>
                            <nav className="h-full flex flex-col">
                                <div className="p-4 border-b">
                                    <div className="flex items-center justify-between">
                                        <Image 
                                            src="/icons/logo.png" 
                                            alt="Logo" 
                                            width={40} 
                                            height={40}
                                        />
                                        {user && (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.image || ''} alt={user.name || ''} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                                        {getInitials(user.name, user.email)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-gray-600">{user.email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="px-4 py-6 flex-1">
                                    <ul className="space-y-4">
                                        {navItems.map((item) => (
                                            <li key={item.href}>
                                                <Link 
                                                    href={item.href}
                                                    className={cn(
                                                        "block text-base font-medium transition-colors", 
                                                        pathname === item.href 
                                                            ? "text-primary" 
                                                            : "text-gray-900 hover:text-primary"
                                                    )}
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                        {user && userNavItems.map((item) => (
                                            <li key={item.href}>
                                                <Link 
                                                    href={item.href}
                                                    className="block text-base font-medium transition-colors text-gray-900 hover:text-gold"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto p-4 border-t space-y-3">
                                    {user ? (
                                        <Button 
                                            onClick={() => signOut()}
                                            variant="ghost"
                                            className="w-full text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/10"
                                        >
                                            Sign out
                                        </Button>
                                    ) : (
                                        <>
                                            <Button 
                                                onClick={() => router.push('/sign-in')}
                                                variant="ghost"
                                                className="w-full text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/10"
                                            >
                                                Sign in
                                            </Button>
                                            <Button 
                                                onClick={() => router.push('/sign-up')}
                                                variant="ghost"
                                                className={cn(
                                                    "w-full text-base font-medium",
                                                    "border-2 border-primary rounded-md",
                                                    "text-primary hover:bg-primary hover:text-white",
                                                    "transition-all duration-300"
                                                )}
                                            >
                                                Sign up
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Header;