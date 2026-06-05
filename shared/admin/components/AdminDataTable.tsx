"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils/general-utils";

interface AdminDataTableProps<TData> {
  data: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  columnVisibility?: VisibilityState;
  loading?: boolean;
  loadingLabel?: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  onRowClick?: (row: TData) => void;
}

const headClass =
  "sticky top-0 z-10 bg-muted/95 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80";

type ColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

function getColumnMeta(meta: unknown): ColumnMeta {
  return (meta ?? {}) as ColumnMeta;
}

/**
 * Admin data table — shadcn Table + TanStack Table (see ui.shadcn.com/docs/components/data-table).
 * Column widths come from cell content; truncate inside cells where needed.
 */
export function AdminDataTable<TData>({
  data,
  columns,
  columnVisibility,
  loading,
  loadingLabel = "Loading…",
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  onRowClick,
}: AdminDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: columnVisibility ? { columnVisibility } : undefined,
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table className="table-auto">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border/70 hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const meta = getColumnMeta(header.column.columnDef.meta);
                return (
                  <TableHead
                    key={header.id}
                    className={cn(headClass, "h-10 p-0 px-1.5", meta.headerClassName)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = getColumnMeta(cell.column.columnDef.meta);
                return (
                  <TableCell
                    key={cell.id}
                    className={cn("p-0 px-1.5 py-2.5", meta.cellClassName)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
