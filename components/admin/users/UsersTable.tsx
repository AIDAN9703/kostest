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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteUserButton } from "@/components/admin/users/DeleteUserButton";

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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-5 py-4 font-medium">User</th>
            <th className="px-5 py-4 font-medium w-[12%]">Role</th>
            <th className="px-5 py-4 font-medium w-[12%]">Status</th>
            <th className="px-5 py-4 font-medium w-[20%]">Email</th>
            <th className="px-5 py-4 font-medium w-[20%]">Phone Number</th>
            <th className="px-5 py-4 font-medium text-right w-[8%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shadow-sm border border-gray-200">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage || user.image || ""}
                        alt={user.username || ""}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-xs font-medium">
                        {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.firstName} {user.lastName || ""}</div>
                    <div className="text-xs text-gray-500">{user.username ? `@${user.username}` : ""}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {user.role}
                </span>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    user.status === "ACTIVE"
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : user.status === "INACTIVE"
                      ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Phone className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                  <span>{user.phoneNumber || "Not provided"}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`} className="cursor-pointer flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}/edit`} className="cursor-pointer flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DeleteUserButton 
                        userId={user.id}
                        userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || ''}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
          
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                No users found. <Link href="/admin/users/create" className="text-primary hover:underline">Add a new user</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 