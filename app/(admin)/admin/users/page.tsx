import { Metadata } from "next";
import { getAllUsers } from "@/lib/actions/admin/users";
import { userRoleEnum, userStatusEnum } from "@/database/schema";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowUpDown, 
  Download, 
  Edit, 
  MoreHorizontal, 
  UserPlus,
  Mail,
  Calendar,
  Clock,
  Eye,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { DeleteUserButton } from "@/components/admin/users/DeleteUserButton";

export const metadata: Metadata = {
  title: "Manage Users | Admin Dashboard",
  description: "Manage all users of the platform",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Need to await searchParams in Next.js 15 
  const resolvedParams = await searchParams;
  
  const page = resolvedParams.page ? parseInt(resolvedParams.page as string) : 1;
  const search = resolvedParams.search as string | undefined;
  const role = resolvedParams.role as typeof userRoleEnum.enumValues[number] | undefined;
  const status = resolvedParams.status as typeof userStatusEnum.enumValues[number] | undefined;
  
  const { users, totalCount, totalPages } = await getAllUsers({
    page,
    limit: 10,
    search,
    role,
    status
  });

  // Helper to format dates
  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-gray-500">Manage all users of the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Link>
        </div>
      </div>

      {/* Filter & Export Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.username || ""}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-primary text-white text-xs font-medium">
                          {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName || ""}</div>
                      <div className="text-xs text-gray-500">{user.username ? `@${user.username}` : ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                      user.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : user.status === "INACTIVE"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="mr-1 h-3.5 w-3.5" />
                    <span>{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(user.lastLoginAt)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                          userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No users found. <Link href="/admin/users/new" className="text-primary hover:underline">Add a new user</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * 10, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> users
          </div>
          <div className="flex gap-1">
            <Link
              href={`/admin/users?page=${Math.max(1, page - 1)}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}${status ? `&status=${status}` : ''}`}
              className={`px-3 py-2 rounded-md border ${page === 1 ? 'text-gray-300 border-gray-200 pointer-events-none' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/users?page=${Math.min(totalPages, page + 1)}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}${status ? `&status=${status}` : ''}`}
              className={`px-3 py-2 rounded-md border ${page === totalPages ? 'text-gray-300 border-gray-200 pointer-events-none' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 