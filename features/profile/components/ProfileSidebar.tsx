"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Bookmark, User } from "lucide-react";
import { cn } from "@/shared/utils/general-utils";

const sidebarItems = [
  {
    href: "/profile/bookings",
    label: "My Bookings",
    icon: Calendar,
  },
  {
    href: "/profile/favorites",
    label: "Favorites",
    icon: Bookmark,
  },
  {
    href: "/profile/settings",
    label: "Account Settings",
    icon: User,
  },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full sm:w-64 flex-shrink-0">
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href === "/profile/bookings" && pathname === "/profile");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-gray-700 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

