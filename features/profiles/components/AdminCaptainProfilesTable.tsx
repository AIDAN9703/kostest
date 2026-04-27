"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Anchor, Eye, MoreVertical, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { CaptainProfileAdminRow } from "@/features/profiles/captain-profile.service";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatDate } from "@/shared/lib/utils/general-utils";

const columnHelper = createColumnHelper<CaptainProfileAdminRow>();

interface AdminCaptainProfilesTableProps {
  rows: CaptainProfileAdminRow[];
  loading?: boolean;
}

function displayName(r: CaptainProfileAdminRow) {
  const n = [r.firstName, r.lastName].filter(Boolean).join(" ").trim();
  return n || r.email;
}

export function AdminCaptainProfilesTable({ rows, loading }: AdminCaptainProfilesTableProps) {
  const columns = useMemo<ColumnDef<CaptainProfileAdminRow, any>[]>(
    () => [
      columnHelper.display({
        id: "person",
        header: "Captain",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Anchor className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground text-sm">
                    {displayName(r)}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{r.email}</div>
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("userStatus", {
        header: "User",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("profileStatus", {
        header: "Profile",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("uscgLicensed", {
        header: "USCG",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("licenseType", {
        header: "License",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("profileUpdatedAt", {
        header: "Updated",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
          const r = row.original;
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
                    <Link href={`/admin/users/${r.userId}`} className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      View user
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${r.userId}/edit`} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit user
                    </Link>
                  </DropdownMenuItem>
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
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading captains…</p>
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Anchor className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium text-foreground">No captain profiles</h3>
          <p className="text-sm text-muted-foreground">
            Enable the captain profile on a user, or adjust filters.
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
                  className="sticky top-0 z-10 bg-muted px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-muted/50">
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
