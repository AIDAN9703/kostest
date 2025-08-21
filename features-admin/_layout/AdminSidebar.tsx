"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ship,
  Users,
  CalendarDays,
  MessageSquare,
  Settings,
  ChevronLeft,
  LogOut,
  HelpCircle,
  FileText,
  PenTool,
  Calendar
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    label: "Boats",
    href: "/admin/boats",
    icon: <Ship className="h-5 w-5" />
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: <CalendarDays className="h-5 w-5" />
  },
  {
    label: "Calendar",
    href: "/admin/calendar",
    icon: <Calendar className="h-5 w-5" />
  },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    label: "Blog Posts",
    href: "/admin/blog",
    icon: <PenTool className="h-5 w-5" />
  },
  {
    label: "Quote Manager",
    href: "/admin/quotes",
    icon: <FileText className="h-5 w-5" />
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

    return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section - Fixed Height */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        {!isCollapsed && (
          <Link href="/" className="flex items-center">
            <Image
              src="/icons/logo.png"
              alt="KOS Yachts Admin"
              width={32}
              height={32}
              className="mr-3"
            />
            <span className="text-lg font-semibold text-gray-900">KOS Admin</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/admin" className="mx-auto">
            <Image
              src="/icons/logo.png"
              alt="KOS"
              width={32}
              height={32}
            />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 text-gray-600 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation - Scrollable if needed */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors",
                  pathname === item.href && "text-gray-900 font-bold border-b-2 border-r-2 border-primary",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex-shrink-0",
                  pathname === item.href ? "text-gray-900 font-bold" : "text-gray-600"
                )}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - Fixed Height */}
      <div className="border-t border-gray-200 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/help"
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-50 transition-colors",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <HelpCircle className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3 text-sm">Help & Support</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/api/auth/signout"
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3 text-sm">Sign Out</span>}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
} 