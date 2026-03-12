"use client";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useDeleteUser } from "@/features/users/hooks/useUserMutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface UserQuickActionsProps {
  userId: string;
}

export function UserQuickActions({ userId }: UserQuickActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteUser = useDeleteUser();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${userId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleDelete}
          className="text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
