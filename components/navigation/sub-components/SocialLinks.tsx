"use client"

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa'

interface SocialLinksProps {
    isHomePage: boolean;
    scrolled: boolean;
}

const SocialLinks: React.FC<SocialLinksProps> = ({
    isHomePage,
    scrolled
}) => {
    // Memoized social link style
    const socialLinkStyle = useMemo(() => cn(
        "transition-all duration-200 hover:scale-110",
        "focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/50 rounded-sm p-1",
        "hover:-translate-y-0.5",
        isHomePage && !scrolled
            ? "text-white hover:text-white/80"
            : "text-gray-700 hover:text-primary"
    ), [isHomePage, scrolled]);

    return (
        <div className="hidden md:flex items-center gap-4">
            <a 
                href="https://instagram.com/kosyachts" 
                target="_blank" 
                rel="noopener noreferrer"
                className={socialLinkStyle}
            >
                <FaInstagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
            </a>
            <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={socialLinkStyle}
            >
                <FaTiktok className="w-5 h-5" />
                <span className="sr-only">TikTok</span>
            </a>
            <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={socialLinkStyle}
            >
                <FaYoutube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
            </a>
        </div>
    )
}

export default SocialLinks 