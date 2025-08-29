"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  MoreHorizontal, 
  Mail,
  Phone,
  Eye,
  Edit
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DeleteUserButton } from "@/features-admin/users/components/DeleteUserButton";
import { FieldDropdown } from "@/features-admin/_shared/FieldDropdown";

// Types
type User = {
  id: string;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  image?: string | null;
  status?: string;
  role?: string;
  phoneNumber?: string | null;
};

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-3 py-2 font-medium">User</th>
            <th className="px-3 py-2 font-medium w-[12%]">Role</th>
            <th className="px-3 py-2 font-medium w-[12%]">Status</th>
            <th className="px-3 py-2 font-medium w-[20%]">Email</th>
            <th className="px-3 py-2 font-medium w-[20%]">Phone Number</th>
            <th className="px-3 py-2 font-medium text-right w-[8%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage || user.image || ""}
                        alt={user.username || ""}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-xs font-medium">
                        {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm truncate">{user.firstName} {user.lastName || ""}</div>
                    <div className="text-xs text-gray-500 truncate">{user.username ? `@${user.username}` : ""}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <FieldDropdown
                  entity="user"
                  id={user.id}
                  field="role"
                  currentValue={user.role || "USER"}
                  size="sm"
                />
              </td>
              <td className="px-3 py-2">
                <FieldDropdown
                  entity="user"
                  id={user.id}
                  field="status"
                  currentValue={user.status || "ACTIVE"}
                  size="sm"
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail className="mr-1 h-3 w-3 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <Phone className="mr-1 h-3 w-3 text-gray-400" />
                  <span className="truncate">{user.phoneNumber || "Not provided"}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/users/${user.id}`} className="text-gray-500 hover:text-primary" title="View">
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link href={`/admin/users/${user.id}/edit`} className="text-gray-500 hover:text-primary" title="Edit">
                    <Edit className="h-5 w-5" />
                  </Link>
                  <DeleteUserButton 
                    userId={user.id}
                    userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || ''}
                    iconOnly
                  />
                </div>
              </td>
            </tr>
          ))}
          
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                No users found. <Link href="/admin/users/create" className="text-primary hover:underline">Add a new user</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 