"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Session } from "next-auth";
import { SimpleNavItem } from "@/shared/constants/navigation-data";
import { getUserInitialsFromName } from "@/shared/utils/user-utils";

interface UserMenuProps {
  user: Session["user"] | undefined | null;
  navigationData: {
    user: SimpleNavItem[];
  };
}

const UserMenu: React.FC<UserMenuProps> = ({ user, navigationData }) => {
  const router = useRouter();
  const navigateToSignIn = useCallback(() => router.push("/sign-in"), [router]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none hover:bg-transparent cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.profileImage || user?.image || ""}
              alt={user.name || "User"}
            />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getUserInitialsFromName(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md border shadow-md z-50">
            <div className="p-2">
              <div className="flex flex-col px-2 py-1.5">
                <p className="text-md text-gold font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Link
                  href="/profile"
                  className="text-xs text-primary underline w-fit mt-1"
                  onClick={() => setIsOpen(false)}
                >
                  View Profile
                </Link>
              </div>
            </div>
            <div className="h-px bg-muted -mx-1" />
            <div className="p-1">
              {navigationData.user.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 rounded-sm hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="px-4 py-2 text-sm font-bold font-poppins border-2 border-primary bg-transparent text-primary rounded-lg hover:bg-primary/5 transition-colors"
      onClick={navigateToSignIn}
    >
      Sign In
    </button>
  );
};

export default React.memo(UserMenu);
