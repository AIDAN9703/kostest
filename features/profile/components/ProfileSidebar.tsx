"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Bookmark, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getUserInitialsFromName } from "@/shared/utils/user-utils";

interface ProfileSidebarProps {
  user: {
    profileImage: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string;
  };
}

const sidebarItems = [
  {
    href: "/profile",
    label: "Overview",
    icon: LayoutDashboard,
  },
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

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  const pathname = usePathname();

  const displayName =
    user.displayName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    "User";

  return (
    <aside className="w-full sm:w-64 flex-shrink-0">
      {/* User Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user.profileImage || undefined}
              alt={displayName}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitialsFromName(displayName, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {displayName}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm font-medium transition-colors rounded-md",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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

