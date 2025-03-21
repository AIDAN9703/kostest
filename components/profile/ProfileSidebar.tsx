"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Home,
  Calendar,
  Heart,
  Ship,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface ProfileSidebarProps {
  user: Session['user'];
}

// Navigation items - defined outside component to prevent recreation on each render
const navigationItems = [
  { name: 'Profile', href: '/profile', icon: Home },
  { name: 'My Bookings', href: '/profile/bookings', icon: Calendar },
  { name: 'Favorites', href: '/profile/favorites', icon: Heart },
  { name: 'My Boats', href: '/profile/boats', icon: Ship },
  { name: 'Account Settings', href: '/profile/settings', icon: Settings },
];

// Main site navigation items
const mainSiteItems = [
  { name: 'Back to Home', href: '/', icon: ChevronLeft },
  { name: 'Browse Boats', href: '/boats', icon: Ship },
];

// User profile section component
const UserProfileSection = ({ user }: { user: Session['user'] }) => (
  <div className="flex items-center p-4 border-b border-gray-200">
    <Avatar className="h-10 w-10">
      <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
      <AvatarFallback className="bg-primary text-white">
        {user?.name?.charAt(0) || "U"}
      </AvatarFallback>
    </Avatar>
    
    <div className="ml-3 overflow-hidden">
      <p className="font-medium truncate">{user?.name}</p>
      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
    </div>
  </div>
);

// Navigation links component
const NavigationLinks = ({ 
  pathname, 
  onItemClick,
  className 
}: { 
  pathname: string; 
  onItemClick?: () => void;
  className?: string;
}) => (
  <div className={cn("space-y-4", className)}>
    {/* Profile navigation */}
    <ul className="space-y-1 px-2">
      {navigationItems.map((item) => {
        // More specific route matching logic
        const isActive = item.href === '/profile' 
          ? pathname === '/profile' // Exact match for profile
          : pathname.startsWith(`${item.href}/`) || pathname === item.href;
        
        const Icon = item.icon;
        
        return (
          <li key={item.name}>
            <Link 
              href={item.href}
              onClick={onItemClick}
            >
              <span className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-gold" 
                  : "text-gray-700 hover:bg-gray-100",
              )}>
                <Icon size={20} className="mr-3" />
                <span>{item.name}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
    
    {/* Divider */}
    <div className="px-4">
      <div className="h-px bg-gray-200"></div>
    </div>
    
    {/* Main site navigation */}
    <div className="px-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
        Main Site
      </h3>
      <ul className="mt-2 space-y-1">
        {mainSiteItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <li key={item.name}>
              <Link 
                href={item.href}
                onClick={onItemClick}
              >
                <span className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  <Icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

// Sign out button component
const SignOutButton = ({ onClick }: { onClick: () => Promise<void> }) => (
  <Button 
    variant="ghost" 
    className="text-gray-700 hover:bg-gray-100 w-full px-3"
    onClick={onClick}
  >
    <LogOut size={20} className="mr-3" />
    <span>Sign out</span>
  </Button>
);

const ProfileSidebar = ({ user }: ProfileSidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle body scroll locking when sidebar is open
  useEffect(() => {
    if (!mounted) return;
    
    if (sidebarOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
    }

    return () => {
      // Cleanup
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, mounted]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Don't render anything during SSR to prevent flash
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Desktop sidebar - fixed position */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-[250px] bg-white border-r border-gray-200 z-20">
        <UserProfileSection user={user} />

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <NavigationLinks pathname={pathname} />
        </nav>

        {/* Sign out button */}
        <div className="p-4 border-t border-gray-200">
          <SignOutButton onClick={handleSignOut} />
        </div>
      </aside>

      {/* Mobile menu button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-md lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={24} className="text-primary" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[250px] bg-white shadow-xl transform transition-transform duration-200 ease-in-out lg:hidden h-[100dvh] overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close menu"
        >
          <ChevronLeft size={24} />
        </button>

        <UserProfileSection user={user} />

        {/* Navigation links - with overflow scrolling */}
        <nav className="flex-1 overflow-y-auto py-4 h-[calc(100dvh-160px)]">
          <NavigationLinks 
            pathname={pathname} 
            onItemClick={() => setSidebarOpen(false)} 
          />
        </nav>

        {/* Sign out button */}
        <div className="p-4 border-t border-gray-200 absolute bottom-0 left-0 w-full bg-white">
          <SignOutButton onClick={handleSignOut} />
        </div>
      </aside>
    </>
  );
};

export default ProfileSidebar; 