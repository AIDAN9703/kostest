"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Session } from "next-auth";
import { SimpleNavItem } from "@/shared/constants/navigation-data";
import { getUserInitialsFromName } from "@/shared/utils/user-utils";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: Session["user"] | undefined | null;
  navigationData: {
    user: SimpleNavItem[];
  };
}

const UserMenu: React.FC<UserMenuProps> = ({ user, navigationData }) => {
  const router = useRouter();

  const navigateToSignIn = useCallback(() => router.push("/sign-in"), [router]);

  // Ultra-simple styling
  const styles = {
    avatarButton:
      "p-0.5 h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:scale-105 transition-all focus-visible:ring-2 focus-visible:ring-primary/50",
    avatar: "h-full w-full ring-2 sm:ring-[2.5px] ring-gray-300/90 bg-white/5",
    avatarFallback:
      "text-xs sm:text-sm font-semibold bg-primary/10 text-primary",
    signInButton:
      "text-[15px] font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-md px-2 py-1 transition-all hover:scale-105",
    dropdownContent:
      "w-64 p-2 bg-white/95 backdrop-blur-xs rounded-lg shadow-lg",
    menuItem:
      "flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-primary/5 transition-colors",
  };

  if (user) {
    return (
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={styles.avatarButton}>
            <Avatar className={styles.avatar}>
              <AvatarImage
                src={user?.profileImage || user?.image || ""}
                className="object-cover"
              />
              <AvatarFallback className={styles.avatarFallback}>
                {getUserInitialsFromName(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className={styles.dropdownContent}
          forceMount
        >
          <DropdownMenuLabel className="px-2 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-2" />

          <div className="flex flex-col space-y-1">
            {navigationData.user.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className={styles.menuItem}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <button onClick={navigateToSignIn} className={styles.signInButton}>
      Sign In
    </button>
  );
};

export default React.memo(UserMenu);
