import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { DefaultUserAvatarFallback } from "@/shared/lib/utils/user-utils";
import { UserQuickActions } from "@/features/users/components/AdminUserQuickActions";
import type { CaptainStatus, CrewStatus } from "@/database/types";

interface UserProfileHeaderProps {
  user: {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
    status?: string | null;
    isAdmin?: boolean;
    bio?: string | null;
  };
  captainProfileStatus: CaptainStatus | null;
  crewProfileStatus: CrewStatus | null;
  isCompact?: boolean;
}

export function UserProfileHeader({
  user,
  captainProfileStatus,
  crewProfileStatus,
  isCompact = false,
}: UserProfileHeaderProps) {
  const displayName =
    (user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : null) ||
    user.username ||
    "User" + user.id;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar
          className={`${isCompact ? "h-16 w-16" : "h-20 w-20"} ring-2 ring-border`}
        >
          <AvatarImage src={user.profileImage || ""} alt={displayName} />
          <DefaultUserAvatarFallback size={isCompact ? "sm" : "lg"} />
        </Avatar>

        <div className="flex flex-col">
          <h2
            className={`${isCompact ? "text-xl" : "text-2xl"} font-bold text-foreground`}
          >
            {displayName}
          </h2>

          <span className="text-xs font-mono text-muted-foreground">
            ID: {user.id}
          </span>

          {!isCompact && user.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 ml-auto">
          <UserQuickActions
            userId={user.id}
            displayName={displayName}
            captainProfileStatus={captainProfileStatus}
            crewProfileStatus={crewProfileStatus}
          />
        </div>
      </div>
    </div>
  );
}
