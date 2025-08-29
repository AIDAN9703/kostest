"use client";

import { CalendarCheck, Check, Clock3, Phone, Mail, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/shared/utils/general-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { FieldDropdown } from "@/features-admin/_shared/FieldDropdown";

// Type for inquiry with details
type InquiryWithDetails = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: Date | null;
  time: string | null;
  budget: string | null;
  guests: number | null;
  message: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string | null;
  notes: string | null;
  contactedAt: Date | null;
  resolvedAt: Date | null;
};

interface InquiriesTableProps {
  inquiries: InquiryWithDetails[];
}

export function InquiriesTable({ inquiries }: InquiriesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 bg-gray-50/70">
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[8%]">ID</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Customer</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[18%]">Contact Info</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[20%]">Details</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[12%]">Status</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium w-[12%]">Date</TableHead>
            <TableHead className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium text-right w-[8%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
                          {inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-3 py-6 text-center text-gray-500">
                    No inquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="px-3 py-2">
                      <span className="font-mono text-xs text-gray-600">
                        {inquiry.id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                          <div className="flex items-center justify-center w-full h-full bg-purple-600 text-white text-xs font-medium">
                            {inquiry.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm truncate">{inquiry.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="text-sm space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="text-gray-600 truncate">{inquiry.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="text-gray-600 truncate">{inquiry.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="text-sm space-y-0.5">
                        {inquiry.guests && (
                          <div className="text-gray-600">
                            <span className="font-medium">Guests:</span> {inquiry.guests}
                          </div>
                        )}
                        {inquiry.budget && (
                          <div className="text-gray-600 truncate">
                            <span className="font-medium">Budget:</span> {inquiry.budget}
                          </div>
                        )}
                        {inquiry.date && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <CalendarCheck className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="truncate">{formatDate(inquiry.date)}</span>
                            {inquiry.time && <span className="truncate"> at {inquiry.time}</span>}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <FieldDropdown
                        entity="inquiry"
                        id={inquiry.id}
                        field="status"
                        currentValue={inquiry.status}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="text-sm text-gray-600">
                        {formatDate(inquiry.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            <span>Contact Customer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
  );
} 