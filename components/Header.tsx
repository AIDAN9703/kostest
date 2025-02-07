"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet"

const Header = () => {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { href: "/search", label: "Explore" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-white backdrop-blur-md py-4 shadow-md" : "bg-transparent py-6"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link href="/" className="relative z-10">
                        <Image 
                            src="/icons/logo.png" 
                            alt="Logo" 
                            width={40} 
                            height={40} 
                            className="transition-transform duration-300 hover:scale-110" 
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:block">
                        <ul className="flex items-center gap-8">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link 
                                        href={item.href}
                                        className={cn(
                                            "text-base font-medium transition-colors duration-300 hover:text-gold", 
                                            pathname === item.href ? "text-gold" : scrolled ? "text-gray-900" : "text-white"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <ul className="flex items-center gap-4">
                                    <li>
                                        <Link href="/sign-in">
                                            <Button 
                                                variant="ghost" 
                                                className={cn(
                                                    "text-base font-medium hover:text-gold hover:bg-white/10",
                                                    scrolled ? "text-gray-900" : "text-white"
                                                )}
                                            >
                                                Sign In
                                            </Button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/sign-up">
                                            <Button 
                                                className="text-base font-medium bg-gold hover:bg-gold/90 text-dark-100"
                                            >
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>

                    {/* Mobile Navigation */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button 
                                className={cn(
                                    "lg:hidden px-4 py-2 text-sm font-medium transition-colors",
                                    scrolled 
                                        ? "text-gray-900 hover:text-gray-600" 
                                        : "text-white hover:text-white/80"
                                )}
                            >
                                Menu
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
                                    <div className="flex items-center">
                                        <Image 
                                            src="/icons/logo.png" 
                                            alt="Logo" 
                                            width={40} 
                                            height={40}
                                        />
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
                                                            ? "text-gold" 
                                                            : "text-gray-900 hover:text-gold"
                                                    )}
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto p-4 border-t space-y-4">
                                    <Link href="/sign-in" className="w-full">
                                        <Button 
                                            variant="outline"
                                            className="w-full text-base font-medium"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/sign-up" className="w-full">
                                        <Button 
                                            className="w-full text-base font-medium bg-gold hover:bg-gold/90 text-dark-100"
                                        >
                                            Sign Up
                                        </Button>
                                    </Link>
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