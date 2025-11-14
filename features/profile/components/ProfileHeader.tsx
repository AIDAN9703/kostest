"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Settings } from "lucide-react";
import { getUserInitials } from "@/shared/utils/user-utils";
import Link from "next/link";

interface ProfileHeaderProps {
  user: any;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const displayName = user?.displayName || 
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 
    user?.username || 
    'User';

  const memberSince = user?.createdAt 
    ? `Member since ${new Date(user.createdAt).getFullYear()}`
    : '';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImage || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {displayName}
            </h1>
            {memberSince && (
              <p className="text-sm text-muted-foreground mt-1">{memberSince}</p>
            )}
            {user?.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 