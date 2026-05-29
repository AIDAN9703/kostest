"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";

interface AdminDataTableProps<TData> {
  data: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  /** Optional fixed column widths (enables table-fixed + colgroup). */
  colWidths?: string[];
  /** Column id whose cells should clip overflow (e.g. the primary name col). */
  clipColumnId?: string;
  loading?: boolean;
  loadingLabel?: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * Generic admin table card. Owns the scroll container, sticky header, and the
 * loading / empty states so feature tables only define their columns.
 *
 * Designed to sit as the `flex-1` middle child of <AdminListShell>: it fills
 * the available height and scrolls its rows internally with a sticky header.
 */
export function AdminDataTable<TData>({
  data,
  columns,
  colWidths,
  clipColumnId,
  loading,
  loadingLabel = "Loading…",
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
}: AdminDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-border/60 bg-card">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">{loadingLabel}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/50 p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <EmptyIcon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">{emptyTitle}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <table className={cn("w-full", colWidths && "table-fixed")}>
        {colWidths ? (
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
        ) : null}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border/70">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="sticky top-0 z-10 bg-muted/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80"
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
        <tbody className="divide-y divide-border/60">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="group transition-colors hover:bg-muted/40"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    "px-4 py-3.5",
                    clipColumnId && cell.column.id === clipColumnId && "overflow-hidden"
                  )}
                >
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
