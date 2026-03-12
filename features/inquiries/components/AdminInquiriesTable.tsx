"use client";

import React, { useMemo } from "react";
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
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MessageSquare, Eye, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { GeneralInquiry } from "@/database/types";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatDate } from "@/shared/lib/utils/general-utils";

const columnHelper = createColumnHelper<GeneralInquiry>();

interface AdminInquiriesTableProps {
  inquiries: GeneralInquiry[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  loading?: boolean;
}

export function AdminInquiriesTable({
  inquiries,
  pagination,
  loading,
}: AdminInquiriesTableProps) {
  const columns = useMemo<ColumnDef<GeneralInquiry, any>[]>(
    () => [
      columnHelper.accessor("name", {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
          const inquiry = row.original;
          return (
            <div className="min-w-0">
              <div className="font-medium text-foreground text-sm truncate">
                {inquiry.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {inquiry.email}
              </div>
              {inquiry.phone && (
                <div className="text-xs text-muted-foreground truncate">
                  {inquiry.phone}
                </div>
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor("stage", {
        header: "Stage",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("outcome", {
        header: "Outcome",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),

      columnHelper.accessor("date", {
        header: "Requested",
        cell: (info) => {
          const date = info.getValue();
          return (
            <div className="text-sm text-muted-foreground">
              {date ? formatDate(date) : "—"}
            </div>
          );
        },
      }),

      columnHelper.accessor("createdAt", {
        header: "Received",
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {formatDate(info.getValue())}
          </div>
        ),
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
          const inquiry = row.original;
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
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
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
    data: inquiries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No inquiries found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or new inquiries will appear here.
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
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
