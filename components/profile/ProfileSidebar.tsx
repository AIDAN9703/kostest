"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  CreditCard, 
  LifeBuoy, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Ship,
  Calendar,
  MessageSquare,
  Bell,
  Heart,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface ProfileSidebarProps {
  user: Session['user'];
}

const ProfileSidebar = ({ user }: ProfileSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const navigationItems = [
    { name: 'Dashboard', href: '/profile', icon: Home },
    { name: 'My Bookings', href: '/profile/bookings', icon: Calendar },
    { name: 'Favorites', href: '/profile/favorites', icon: Heart },
    { name: 'Messages', href: '/profile/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/profile/notifications', icon: Bell },
    { name: 'My Boats', href: '/profile/boats', icon: Ship },
    { name: 'Documents', href: '/profile/documents', icon: FileText },
    { name: 'Verification', href: '/profile/verification', icon: ShieldCheck },
    { name: 'Payment Methods', href: '/profile/payment', icon: CreditCard },
    { name: 'Account Settings', href: '/profile/settings', icon: Settings },
    { name: 'Help & Support', href: '/profile/support', icon: LifeBuoy },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:relative z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          collapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {/* Toggle button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* User profile section */}
        <div className={cn(
          "flex items-center p-4 border-b border-gray-200",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-primary text-white">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <span className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-gray-700 hover:bg-gray-100",
                      collapsed ? "justify-center" : "justify-start"
                    )}>
                      <Icon size={20} className={cn(
                        collapsed ? "mx-0" : "mr-3"
                      )} />
                      {!collapsed && <span>{item.name}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign out button */}
        <div className={cn(
          "p-4 border-t border-gray-200",
          collapsed ? "flex justify-center" : ""
        )}>
          <Button 
            variant="ghost" 
            className={cn(
              "text-gray-700 hover:bg-gray-100 w-full",
              collapsed ? "px-2" : "px-3"
            )}
            onClick={handleSignOut}
          >
            <LogOut size={20} className={cn(
              collapsed ? "mx-0" : "mr-3"
            )} />
            {!collapsed && <span>Sign out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {collapsed && isMobile && (
        <button 
          onClick={() => setCollapsed(false)}
          className="fixed bottom-4 left-4 z-50 bg-primary text-white rounded-full p-3 shadow-lg lg:hidden"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </>
  );
};

export default ProfileSidebar; 