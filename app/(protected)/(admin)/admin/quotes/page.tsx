"use client";

import { 
  Download, 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";

export default function QuotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
            <p className="text-gray-600 mt-1">Manage and track your customer quotes</p>
          </div>
          <Link href="/admin/quotes/create">
            <Button className="bg-gray-900 hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search quotes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[300px] border-gray-200"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-200">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter: {statusFilter === "all" ? "All" : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Quotes</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter("DRAFT")}>Draft</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("SENT")}>Sent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("ACCEPTED")}>Accepted</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("REJECTED")}>Rejected</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("EXPIRED")}>Expired</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-sm text-gray-500">
                0 quotes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Get started by creating your first quote for a customer. You can generate professional PDFs and track quote status.
              </p>
              <Link href="/admin/quotes/create">
                <Button className="bg-gray-900 hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Quote
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 