"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Anchor, UsersRound } from "lucide-react";
import Link from "next/link";
import { useDeleteUser } from "@/features/users/hooks/useUserMutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/lib/hooks/use-toast";
import type { CaptainStatus, CrewStatus } from "@/database/types";
import {
  canPromoteToCaptain,
  canPromoteToCrew,
} from "@/features/profiles/promote-eligibility";
import { PromoteToCaptainModal } from "@/features/profiles/components/PromoteToCaptainModal";
import { PromoteToCrewModal } from "@/features/profiles/components/PromoteToCrewModal";

interface UserQuickActionsProps {
  userId: string;
  displayName: string;
  captainProfileStatus: CaptainStatus | null;
  crewProfileStatus: CrewStatus | null;
}

export function UserQuickActions({
  userId,
  displayName,
  captainProfileStatus,
  crewProfileStatus,
}: UserQuickActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteUser = useDeleteUser();
  const [captainOpen, setCaptainOpen] = useState(false);
  const [crewOpen, setCrewOpen] = useState(false);

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    deleteUser.mutate(userId, {
      onSuccess: (result) => {
        if (result.success) {
          router.push("/admin/users");
          toast({ title: "User deleted successfully" });
        } else {
          toast({
            title: "Error",
            description: typeof result.error === "string" ? result.error : "Failed to delete user",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${userId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </DropdownMenuItem>
          {canPromoteToCaptain(captainProfileStatus) ? (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setCaptainOpen(true);
              }}
            >
              <Anchor className="mr-2 h-4 w-4" />
              Promote to Captain
            </DropdownMenuItem>
          ) : null}
          {canPromoteToCrew(crewProfileStatus) ? (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setCrewOpen(true);
              }}
            >
              <UsersRound className="mr-2 h-4 w-4" />
              Promote to Crew
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleDelete}
            className="cursor-pointer text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PromoteToCaptainModal
        userId={userId}
        displayName={displayName}
        open={captainOpen}
        onOpenChange={setCaptainOpen}
      />
      <PromoteToCrewModal
        userId={userId}
        displayName={displayName}
        open={crewOpen}
        onOpenChange={setCrewOpen}
      />
    </>
  );
}
