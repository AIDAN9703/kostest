"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MoreHorizontal,
  Anchor,
  Flag,
  Eye,
  Edit,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteBoatButton } from "@/components/admin/boats/DeleteBoatButton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/general-utils";

// Types
type Boat = {
  id: string;
  name: string;
  category: string;
  capacity: number;
  active: boolean;
  featured: boolean;
  mainImage?: string | null;
  make?: string | null;
  model?: string | null;
  ownerName?: string | null;
  basePrice?: number | null;
  lengthFt?: number | null;
  ownerId?: string | null;
  pricingTiers?: Array<{
    id: string;
    name?: string | null;
    price: number;
    hours: number;
    isDefault: boolean;
  }>;
};

interface BoatsTableProps {
  boats: Boat[];
}

export function BoatsTable({ boats }: BoatsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-5 py-4 font-medium">Boat</th>
            <th className="px-5 py-4 font-medium w-[12%]">Category</th>
            <th className="px-5 py-4 font-medium w-[12%]">Status</th>
            <th className="px-5 py-4 font-medium w-[15%]">Price</th>
            <th className="px-5 py-4 font-medium w-[12%]">Capacity</th>
            <th className="px-5 py-4 font-medium text-right w-[8%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {boats.map((boat) => (
            <tr key={boat.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shadow-sm border border-gray-200">
                    {boat.mainImage ? (
                      <Image
                        src={boat.mainImage}
                        alt={boat.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-blue-50">
                        <Anchor className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{boat.name}</div>
                    <div className="text-xs text-gray-500">
                      {boat.make && boat.model
                        ? `${boat.make} ${boat.model}`
                        : boat.make || boat.model || "No make/model"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {boat.category.replace('_', ' ')}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-col gap-1">
                  <Badge variant={boat.active ? "success" : "secondary"} className="w-fit">
                    {boat.active ? "Active" : "Inactive"}
                  </Badge>
                  {boat.featured && (
                    <Badge variant="warning" className="w-fit">
                      Featured
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                  {boat.basePrice ? (
                    <span>{formatCurrency(boat.basePrice)}</span>
                  ) : (
                    <span className="text-gray-400">No pricing</span>
                  )}
                </div>
              </td>
              <td className="px-5 py-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Flag className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                  <span>{boat.capacity} people</span>
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
                        <Link href={`/admin/boats/${boat.id}`} className="cursor-pointer flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/boats/${boat.id}/edit`} className="cursor-pointer flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DeleteBoatButton
                        boatId={boat.id}
                        boatName={boat.name}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
          
          {boats.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                No boats found. <Link href="/admin/boats/create" className="text-primary hover:underline">Add a new boat</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 