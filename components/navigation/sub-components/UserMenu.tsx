"use client"

import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/general-utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Session } from 'next-auth'
import { NavigationItem } from '@/lib/types/types'
import { signOut } from 'next-auth/react'

interface UserMenuProps {
    user: Session['user'] | undefined | null;
    navigationData: {
        user: NavigationItem[];
    };
    isHomePage: boolean;
    scrolled: boolean;
    getInitials: (name?: string | null, email?: string | null) => string;
}

const UserMenu: React.FC<UserMenuProps> = ({
    user,
    navigationData,
    isHomePage,
    scrolled,
    getInitials
}) => {
    const router = useRouter();

    // Memoized navigation handlers
    const navigateToSignIn = useCallback(() => router.push('/sign-in'), [router]);
    const navigateToSignUp = useCallback(() => router.push('/sign-up'), [router]);
    
    // Memoized button styles
    const logOnButtonStyle = useMemo(() => cn(
        "text-[15px] font-medium tracking-wide",
        "border-2 rounded-md px-2 py-1",
        "transition-all duration-300",
        "focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/50",
        "hover:scale-105 active:scale-95",
        isHomePage && !scrolled
            ? "border-white text-white hover:bg-white hover:text-gray-900"
            : "border-primary text-primary hover:bg-primary hover:text-white"
    ), [isHomePage, scrolled]);
    
    const avatarButtonStyle = useMemo(() => cn(
        "p-0.5 h-10 w-10 sm:h-11 sm:w-11 rounded-full",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus:outline-none focus:ring-0 focus:ring-offset-0",
        isHomePage && !scrolled
            ? "focus-visible:ring-white/80 focus-visible:ring-offset-transparent"
            : "focus-visible:ring-white/50 focus-visible:ring-offset-white",
        "transition-all duration-300 hover:scale-105",
        "data-[state=open]:bg-transparent",
        "[&:not(:focus-visible)]:ring-0 [&:not(:focus-visible)]:ring-offset-0",
        "after:hidden"
    ), [isHomePage, scrolled]);
    
    const avatarStyle = useMemo(() => cn(
        "h-full w-full transition-all duration-300",
        "ring-[2px] sm:ring-[2.5px]",
        isHomePage && !scrolled 
            ? "ring-white/90 bg-white/10" 
            : "ring-gray-300/90 bg-white/5"
    ), [isHomePage, scrolled]);
    
    const avatarFallbackStyle = useMemo(() => cn(
        "text-xs sm:text-sm font-semibold",
        isHomePage && !scrolled
            ? "bg-white/20 text-white"
            : "bg-primary/10 text-primary"
    ), [isHomePage, scrolled]);

    if (user) {
        return (
            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        className={avatarButtonStyle}
                    >
                        <Avatar className={avatarStyle}>
                            <AvatarImage 
                                src={user?.profileImage || user?.image || ''} 
                                className="object-cover"
                            />
                            <AvatarFallback className={avatarFallbackStyle}>
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
                        <p className="font-medium text-gray-900 truncate px-2">
                            {user.name}
                        </p>
                        <Link 
                            href="/profile" 
                            className="text-xs text-gray-500 truncate px-2 block hover:text-primary"
                        >
                            View profile
                        </Link>
                    </div>
                    <div className="py-2">
                        {navigationData.user.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>

                                    <Link 
                                        href={item.href}
                                        className="w-full px-2 py-1.5 text-[15px] text-gray-700 rounded-md hover:bg-primary/5 hover:text-primary flex items-center gap-2"
                                    >
                                        {item.icon && (
                                            <span className="text-gray-500">
                                                <item.icon className="h-4 w-4" />
                                            </span>
                                        )}
                                        <span>{item.label}</span>
                                    </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <button
            onClick={navigateToSignIn}
            className={logOnButtonStyle}
        >
           Sign On
        </button>
    )
}

export default UserMenu 