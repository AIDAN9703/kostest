"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Anchor,
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type BoatListItem } from "@/features/boats/boat.types";
import { formatCurrency } from "@/shared/utils/general-utils";
import { StatusBadge } from "@/shared/utils/badge-utils";

// Props interface
interface ModernBoatsTableProps {
  boats: BoatListItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  loading?: boolean;
  onDelete?: (boatId: string) => void;
  onPageChange?: (page: number) => void;
}

const columnHelper = createColumnHelper<BoatListItem>();

export function ModernBoatsTable({ 
  boats, 
  pagination,
  loading = false,
  onDelete,
  onPageChange 
}: ModernBoatsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Get selected boats
  const selectedBoats = useMemo(() => {
    return boats.filter((_, index) => rowSelection[index]);
  }, [boats, rowSelection]);

  // Handle export to quote
  const handleExportToQuote = () => {
    console.log('Selected boats for quote:', selectedBoats);
    // TODO: Navigate to quote builder with selected boats
    alert(`Selected ${selectedBoats.length} boats for quote. Quote builder coming soon!`);
  };

  // Handle export as list
  const handleExportList = () => {
    const boatList = selectedBoats.map(b => `${b.name} - ${b.category} - ${b.lengthFt}ft`).join('\n');
    navigator.clipboard.writeText(boatList);
    alert(`Copied ${selectedBoats.length} boats to clipboard!`);
  };

  // Define columns
  const columns = useMemo<ColumnDef<BoatListItem, any>[]>(
    () => [
      // Selection column
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Boat',
        cell: (info) => {
          const boat = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {boat.mainImage ? (
                  <Image
                    src={boat.mainImage}
                    alt={boat.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-50">
                    <Anchor className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">{boat.name}</div>
                <div className="text-sm text-gray-500 truncate">
                  {boat.lengthFt ? `${boat.lengthFt}ft` : 'No length'} • {boat.capacity ? `${boat.capacity} guests` : 'No capacity'}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => (
          <div className="text-sm text-gray-900 capitalize">
            {info.getValue()?.toLowerCase().replace(/_/g, ' ') || 'N/A'}
          </div>
        ),
      }),
      columnHelper.accessor('ownerName', {
        header: 'Owner',
        cell: (info) => (
          <div className="text-sm text-gray-900">
            {info.getValue() || 'No owner'}
          </div>
        ),
      }),
      columnHelper.accessor('basePrice', {
        header: 'Base Price',
        cell: (info) => {
          const price = info.getValue();
          return (
            <div className="text-sm font-medium text-gray-900">
              {price ? formatCurrency(price) : 'No pricing'}
            </div>
          );
        },
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => {
          const active = info.getValue();
          const featured = info.row.original.featured;
          return (
            <div className="flex flex-col gap-1">
              <StatusBadge status={active} />
              {featured && <StatusBadge status="FEATURED" />}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const boat = info.row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link href={`/admin/boats/${boat.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                  <Eye className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
              <Link href={`/admin/boats/${boat.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                  <Edit className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(boat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [onDelete]
  );

  const table = useReactTable({
    data: boats,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading boats...</p>
        </div>
      </div>
    );
  }

  if (!boats || boats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Anchor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No boats found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or add a new boat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Selection Toolbar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex-shrink-0 bg-slate-700 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedBoats.length} boat{selectedBoats.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              onClick={() => setRowSelection({})}
              variant="ghost"
              size="sm"
              className="h-8 text-white hover:bg-slate-600 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportList}
              variant="ghost"
              size="sm"
              className="h-8 text-white hover:bg-slate-600 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
            <Button
              onClick={handleExportToQuote}
              className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          </div>
        </div>
      )}

      {/* Table Container with proper overflow */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-slate-50 px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'flex items-center gap-2 cursor-pointer select-none group'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-slate-400 group-hover:text-slate-600">
                            {{
                              asc: <ChevronUp className="h-4 w-4" />,
                              desc: <ChevronDown className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronUp className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Fixed at bottom */}
      {pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalCount)}</span> of{' '}
              <span className="font-medium">{pagination.totalCount}</span> boats
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(1)}
                disabled={pagination.page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-700 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
