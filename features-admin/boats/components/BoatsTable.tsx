"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MoreHorizontal,
  Anchor,
  Flag,
  Eye,
  Edit,
  DollarSign,
  Trash
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DeleteBoatButton } from "@/features-admin/boats/components/DeleteBoatButton";

import { formatCurrency } from "@/shared/utils/general-utils";
import { FieldDropdown } from "@/features-admin/_shared/FieldDropdown";
import type { Boat } from "@/shared/types/types";

interface BoatsTableProps {
  boats: Boat[];
}

export function BoatsTable({ boats }: BoatsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-3 py-2 font-medium">Boat</th>
            <th className="px-3 py-2 font-medium w-[12%]">Category</th>
            <th className="px-3 py-2 font-medium w-[12%]">Status</th>
            <th className="px-3 py-2 font-medium w-[15%]">Price</th>
            <th className="px-3 py-2 font-medium w-[12%]">Capacity</th>
            <th className="px-3 py-2 font-medium text-right w-[8%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {boats.map((boat) => (
            <tr key={boat.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    {boat.mainImage ? (
                      <Image
                        src={boat.mainImage}
                        alt={boat.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-blue-50">
                        <Anchor className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm truncate">{boat.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {boat.make && boat.model
                        ? `${boat.make} ${boat.model}`
                        : boat.make || boat.model || "No make/model"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <FieldDropdown
                  entity="boat"
                  id={boat.id}
                  field="category"
                  currentValue={boat.category ?? null}
                  size="sm"
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <FieldDropdown
                    entity="boat"
                    id={boat.id}
                    field="active"
                    currentValue={boat.active}
                    size="sm"
                  />
                  <FieldDropdown
                    entity="boat"
                    id={boat.id}
                    field="featured"
                    currentValue={boat.featured ?? null}
                    size="sm"
                  />
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center text-gray-600 text-sm">
                  <DollarSign className="mr-1 h-3 w-3 text-gray-400" />
                  {boat.basePrice ? (
                    <span>{formatCurrency(boat.basePrice)}</span>
                  ) : (
                    <span className="text-gray-400">No pricing</span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <Flag className="mr-1 h-3 w-3 text-gray-400" />
                  <span>{boat.capacity} people</span>
                </div>
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/boats/${boat.id}`} className="text-gray-500 hover:text-primary" title="View">
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link href={`/admin/boats/${boat.id}/edit`} className="text-gray-500 hover:text-primary" title="Edit">
                    <Edit className="h-5 w-5" />
                  </Link>
                  <DeleteBoatButton
                    boatId={boat.id}
                    boatName={boat.name}
                    iconOnly
                  />
                </div>
              </td>
            </tr>
          ))}
          
          {boats.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                No boats found. <Link href="/admin/boats/create" className="text-primary hover:underline">Add a new boat</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 