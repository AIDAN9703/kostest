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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils/general-utils";
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
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: <MessageSquare className="h-5 w-5" />
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <Image 
              src="/icons/logo.png" 
              alt="KOS Yachts Admin" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <span className="text-xl font-bold text-primary">KOS Admin</span>
          </Link>
        )}
        {collapsed && (
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
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className={cn(
            "h-5 w-5 text-gray-600 transition-transform",
            collapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50",
                  pathname === item.href && "bg-blue-50 text-primary",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                {item.icon}
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/help"
              className={cn(
                "flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <HelpCircle className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Help & Support</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/api/auth/signout"
              className={cn(
                "flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Sign Out</span>}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
} 