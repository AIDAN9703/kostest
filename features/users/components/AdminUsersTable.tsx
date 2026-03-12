"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  UserCircle2,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { UserListItem } from "@/features/users/user.types";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { Badge } from "@/shared/components/ui/badge";
import { formatDate } from "@/shared/lib/utils/general-utils";
import { useDeleteUser } from "@/features/users/hooks/useUserMutations";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface AdminUsersTableProps {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  loading?: boolean;
}

const columnHelper = createColumnHelper<UserListItem>();

export function AdminUsersTable({
  users,
  pagination,
  loading,
}: AdminUsersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteUser = useDeleteUser();

  const handleDelete = (userId: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    deleteUser.mutate(userId, {
      onSuccess: (result) => {
        if (result.success) {
          router.refresh();
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

  // Define columns - simplified and more compact
  const columns = useMemo<ColumnDef<UserListItem, any>[]>(
    () => [
      columnHelper.accessor("firstName", {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground text-sm truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
                {user.phoneNumber && (
                  <div className="text-xs text-muted-foreground truncate">
                    {user.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("isAdmin", {
        header: "Admin",
        cell: (info) => (
          <Badge variant={info.getValue() ? "default" : "secondary"} className="text-xs">
            {info.getValue() ? "Yes" : "No"}
          </Badge>
        ),
      }),

      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),

      columnHelper.accessor("createdAt", {
        header: "Joined",
        cell: (info) => {
          const date = info.getValue();
          return (
            <div className="text-sm text-muted-foreground">
              {date ? formatDate(date) : "—"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </Link>
                  </DropdownMenuItem>
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => handleDelete(user.id)}
                      className="text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <UserCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No users found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or add a new user.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-muted px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
