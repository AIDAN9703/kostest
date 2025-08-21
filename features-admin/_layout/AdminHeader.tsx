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
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 h-16 flex items-center px-6 w-full shadow-sm">
      <div className="flex-1">
        <GlobalSearch />
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
          <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            className="flex items-center space-x-3 focus:outline-none group p-1 rounded-xl hover:bg-gray-100 transition-all duration-200"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {session?.user?.profileImage ? (
                <Image
                  src={session.user.profileImage}
                  alt={session.user.name || "Admin"}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-900">
                {session?.user?.name || "Admin User"}
              </div>
              <div className="text-xs text-gray-500">
                {session?.user?.email || "admin@example.com"}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-all duration-200" />
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/80 py-2 z-50"
              onBlur={() => setShowDropdown(false)}
            >
              <Link
                href="/admin/profile"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mx-1 transition-colors duration-200"
                onClick={() => setShowDropdown(false)}
              >
                <User className="mr-3 h-4 w-4 text-gray-500" />
                Your Profile
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mx-1 transition-colors duration-200"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                Settings
              </Link>
              <Link
                href="/admin/help"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mx-1 transition-colors duration-200"
                onClick={() => setShowDropdown(false)}
              >
                <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                Help & Support
              </Link>
              <div className="border-t border-gray-200/80 my-2"></div>
              <Link
                href="/api/auth/signout"
                className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-1 transition-colors duration-200"
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