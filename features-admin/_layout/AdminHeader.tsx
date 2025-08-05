"use client";

import { useState } from "react";
import { 
  Bell, 
  User, 
  ChevronDown, 
  Settings, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils/general-utils";
import { GlobalSearch } from "@/features-admin/_layout/GlobalSearch";
import { Session } from "next-auth";

export default function AdminHeader({ session }: { session: Session }) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 w-full">
      <div className="flex-1">
        <GlobalSearch />
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>
        
        {/* User Menu */}
        <div className="relative">
          <button 
            className="flex items-center space-x-3 focus:outline-none"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {session?.user?.profileImage ? (
                <Image 
                  src={session.user.profileImage} 
                  alt={session.user.name || "Admin"} 
                  width={36} 
                  height={36} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">
                {session?.user?.name || "Admin User"}
              </div>
              <div className="text-xs text-gray-500">
                {session?.user?.email || "admin@example.com"}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50"
              onBlur={() => setShowDropdown(false)}
            >
              <Link 
                href="/admin/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <User className="mr-3 h-4 w-4 text-gray-500" />
                Your Profile
              </Link>
              <Link 
                href="/admin/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                Settings
              </Link>
              <Link 
                href="/admin/help" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                Help & Support
              </Link>
              <div className="border-t border-gray-200 my-1"></div>
              <Link 
                href="/api/auth/signout" 
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <LogOut className="mr-3 h-4 w-4 text-red-500" />
                Sign out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 