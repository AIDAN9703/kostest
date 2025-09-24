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
  Calendar,
  PartyPopper
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
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: <PartyPopper className="h-5 w-5" />
  },
  {
    label: "Boats",
    href: "/admin/boats",
    icon: <Ship className="h-5 w-5" />
  },
  {
    label: "Bookings",
    href: "/admin/bookings/portal",
    icon: <CalendarDays className="h-5 w-5" />
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
      "flex flex-col h-screen transition-all duration-300 ease-in-out bg-gold text-white rounded-tr-3xl rounded-br-3xl",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section - Fixed Height */}
      <div className="flex items-center justify-between p-4 h-16">
        {!isCollapsed && (
          <Link href="/" className="flex items-center">
            <Image
              src="/icons/logo.png"
              alt="KOS Yachts Admin"
              width={32}
              height={32}
              className="mr-3"
            />
            <span className="text-lg font-semibold font-poppins">KOS Admin</span>
          </Link>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 text-white/80 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation - Scrollable if needed */}
      <nav className="flex-1 pl-2 overflow-y-auto font-poppins">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative isolate flex items-center px-3 py-2.5 text-white/85 hover:bg-white/10 rounded-tl-3xl rounded-bl-3xl transition-colors",
                  pathname === item.href &&
                    "text-gold bg-white hover:bg-white px z-20 transition-none before:transition-none after:transition-none before:content-[''] after:content-[''] before:absolute after:absolute before:pointer-events-none after:pointer-events-none before:right-0 before:-top-8 after:right-0 after:-bottom-8 before:h-8 before:w-8 after:h-8 after:w-8 before:rounded-full after:rounded-full before:shadow-[16px_16px_0_0_white] after:shadow-[16px_-16px_0_0_white]",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <div className={cn(
                  "shrink-0",
                  pathname === item.href ? "text-gold" : "text-white/80"
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
      <div className="p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/help"
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-white/85 hover:bg-white/10 transition-colors",
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
                "flex items-center px-3 py-2.5 rounded-md text-white/85 hover:bg-red-500/10 hover:text-white transition-colors",
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