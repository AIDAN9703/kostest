"use client";

import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Session } from "next-auth";
import { SimpleNavItem } from "@/shared/constants/navigation-data";
import { getUserInitialsFromName } from "@/shared/utils/user-utils";

interface UserMenuProps {
  user: Session["user"] | undefined | null;
  navigationData: {
    user: SimpleNavItem[];
  };
}

export default function UserMenu({ user, navigationData }: UserMenuProps) {
  if (user) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-full p-0"
            aria-label="User menu"
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
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="w-56"
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-primary">
                Hello, {user.name}
              </p>
              <p className="text-xs text-muted-foreground font-normal">
                {user.email}
              </p>
              <Link
                href="/profile"
                className="text-xs text-primary underline w-fit mt-1"
              >
                View Profile
              </Link>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navigationData.user.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="cursor-pointer">
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="outline" asChild>
      <Link href="/sign-in">Sign In</Link>
    </Button>
  );
}
