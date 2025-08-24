"use client";

import { useState } from "react";
import {
  Bell,
  User,
  ChevronDown,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Ship,
  Users,
  CalendarDays,
  FileText,
  PenTool
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils/general-utils";
import { GlobalSearch } from "@/features-admin/_layout/GlobalSearch";
import { Session } from "next-auth";

// Quick action items
const quickActions = [
  {
    label: "Create Boat",
    href: "/admin/boats/create",
    icon: <Ship className="h-4 w-4" />,
    color: "text-blue-600 hover:text-blue-700"
  },
  {
    label: "Create User", 
    href: "/admin/users/create",
    icon: <Users className="h-4 w-4" />,
    color: "text-green-600 hover:text-green-700"
  },
  {
    label: "Create New Quote",
    href: "/admin/quotes/create", 
    icon: <FileText className="h-4 w-4" />,
    color: "text-purple-600 hover:text-purple-700"
  },
  {
    label: "Create Blog Post",
    href: "/admin/blog/create",
    icon: <PenTool className="h-4 w-4" />,
    color: "text-orange-600 hover:text-orange-700"
  }
];

export default function AdminHeader({ session }: { session: Session }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 h-16 flex items-center px-6 w-full shadow-sm">
      <div className="flex-1 flex items-center space-x-4">
        <GlobalSearch />
        
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="font-medium text-sm text-primary relative group flex items-center"
          >
            <Plus className="h-4 w-4" />
            <span className="relative">
              Actions
            </span>
          </button>
          
          {showQuickActions && (
            <div
              className="absolute left-0 mt-3 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/80 py-2 z-50"
              onBlur={() => setShowQuickActions(false)}
            >
              <div className="px-3 py-2 border-b border-gray-200/80">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Quick Actions
                </span>
              </div>
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 rounded-lg mx-1 transition-colors duration-200"
                  onClick={() => setShowQuickActions(false)}
                >
                  <span className={cn("mr-3", action.color)}>
                    {action.icon}
                  </span>
                  <span className="text-gray-700 font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
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