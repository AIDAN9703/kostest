"use client";

import { useMemo } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MessageSquare, Eye, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { Inquiry } from "@/database/types";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatDate, formatPlainDate } from "@/shared/lib/utils/general-utils";
import { AdminDataTable } from "@/shared/admin/components/AdminDataTable";

const LEAD_TYPE_LABELS: Record<string, string> = {
  GENERAL_QUOTE: "General",
  BOAT_REQUEST: "Boat",
  TERM_CHARTER: "Term",
  MANUAL: "Manual",
};

interface AdminInquiriesTableProps {
  inquiries: Inquiry[];
  loading?: boolean;
}

const columnHelper = createColumnHelper<Inquiry>();

export function AdminInquiriesTable({ inquiries, loading }: AdminInquiriesTableProps) {
  const columns = useMemo<ColumnDef<Inquiry, any>[]>(
    () => [
      columnHelper.accessor("name", {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
          const inquiry = row.original;
          return (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {inquiry.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {inquiry.email}
              </div>
              {inquiry.phone ? (
                <div className="truncate text-xs text-muted-foreground">
                  {inquiry.phone}
                </div>
              ) : null}
            </div>
          );
        },
      }),

      columnHelper.accessor("leadType", {
        header: "Type",
        cell: (info) => (
          <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {LEAD_TYPE_LABELS[info.getValue()] ?? info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor("stage", {
        header: "Stage",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("outcome", {
        header: "Outcome",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),

      columnHelper.accessor((row) => row.requestedStartDateTime ?? row.preferredDate ?? row.date, {
        id: "requested",
        header: "Requested",
        cell: ({ row }) => {
          const i = row.original;
          const label = i.requestedStartDateTime
            ? formatDate(i.requestedStartDateTime)
            : i.preferredDate
              ? formatPlainDate(i.preferredDate)
              : i.date
                ? formatDate(i.date)
                : "—";
          return <div className="text-sm text-muted-foreground">{label}</div>;
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
        header: () => <div className="pr-2 text-right">Actions</div>,
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
                      <Eye className="mr-2 h-4 w-4" />
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

  return (
    <AdminDataTable
      data={inquiries}
      columns={columns}
      loading={loading}
      loadingLabel="Loading inquiries…"
      emptyIcon={MessageSquare}
      emptyTitle="No inquiries found"
      emptyDescription="Try adjusting your filters, or new inquiries will appear here."
    />
  );
}
