"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  createdAt?: string | Date;
};

interface ModernUsersTableProps {
  users: User[];
  loading?: boolean;
  onDelete?: (userId: string) => void;
  onUpdateField?: (userId: string, field: string, value: string) => void;
}

const columnHelper = createColumnHelper<User>();

export function ModernUsersTable({ users, loading, onDelete, onUpdateField }: ModernUsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<User, any>[]>(() => [
    columnHelper.accessor("firstName", {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
              {user.profileImage || user.image ? (
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
              <div className="font-medium text-gray-900 text-sm truncate">
                {user.firstName} {user.lastName || ""}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user.username ? `@${user.username}` : ""}
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
    }),

    columnHelper.accessor("role", {
      header: "Role",
      cell: ({ row }) => (
        <FieldDropdown
          entity="user"
          id={row.original.id}
          field="role"
          currentValue={row.original.role || "USER"}
          size="sm"
        />
      ),
      enableSorting: true,
      size: 120,
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <FieldDropdown
          entity="user"
          id={row.original.id}
          field="status"
          currentValue={row.original.status || "ACTIVE"}
          size="sm"
        />
      ),
      enableSorting: true,
      size: 120,
    }),

    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ getValue }) => {
        const email = getValue();
        return (
          <div className="flex items-center text-gray-600 text-sm">
            <Mail className="mr-2 h-3 w-3 text-gray-400" />
            <span className="truncate">{email}</span>
          </div>
        );
      },
      enableSorting: true,
      size: 200,
    }),

    columnHelper.accessor("phoneNumber", {
      header: "Phone",
      cell: ({ getValue }) => {
        const phone = getValue();
        return (
          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="mr-2 h-3 w-3 text-gray-400" />
            <span className="truncate">{phone || "Not provided"}</span>
          </div>
        );
      },
      enableSorting: true,
      size: 160,
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Link 
              href={`/admin/users/${user.id}`} 
              className="text-gray-500 hover:text-blue-600 transition-colors" 
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link 
              href={`/admin/users/${user.id}/edit`} 
              className="text-gray-500 hover:text-blue-600 transition-colors" 
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Link>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(user.id)}
                className="text-gray-500 hover:text-red-600 transition-colors p-1 h-auto"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
      size: 100,
    }),
  ], [onDelete]);

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} of {users.length} users
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr 
                key={headerGroup.id}
                className="border-b border-gray-100 bg-gray-50/70"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1 hover:text-gray-700"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
