"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { DefaultUserAvatarFallback } from "@/shared/lib/utils/user-utils";

type AdminUserNavProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function AdminUserNav({ user }: AdminUserNavProps) {
  if (!user) return null;

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
      <Avatar className="h-8 w-8 rounded-full">
        <AvatarImage src={user.image ?? ""} alt={user.name ?? "Admin"} />
        <AvatarFallback className="rounded-full">
          <DefaultUserAvatarFallback size="sm" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
