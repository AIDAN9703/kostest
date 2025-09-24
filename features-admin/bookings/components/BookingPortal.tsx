"use client";

import { useQueryState } from "nuqs";
import { useState } from "react";
import { 
  Calendar as CalendarIcon,
  Search,
  MessageSquare,
  CalendarDays,
  X,
  SlidersHorizontal
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/shared/components/ui/popover";

// Tab imports (we'll create these)
import { AllBookingsTab } from "./tabs/AllBookingsTab";
import { InquiriesTab } from "./tabs/InquiriesTab"; 
import { CalendarTab } from "./tabs/CalendarTab";

interface BookingPortalProps {
  searchParams: {
    tab?: string;
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    boat?: string;
    customer?: string;
  };
  bookingsData: {
    bookings: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  inquiriesData: {
    inquiries: any[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

// Tab definitions
const tabs = [
  {
    id: "all",
    label: "All Bookings",
    icon: CalendarDays,
    description: "View and manage all bookings"
  },
  {
    id: "inquiries", 
    label: "Inquiries",
    icon: MessageSquare,
    description: "Handle booking inquiries and requests"
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarIcon,
    description: "Visual calendar view of bookings"
  }
];

// Filter options
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "INSTANT", label: "Instant Book" },
  { value: "REQUEST", label: "Request to Book" },
  { value: "INQUIRY", label: "General Inquiry" },
];

export function BookingPortal({ searchParams, bookingsData, inquiriesData }: BookingPortalProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Use nuqs for URL state management
  const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'all' });
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });
  const [type, setType] = useQueryState('type', { defaultValue: 'all' });
  const [dateFrom, setDateFrom] = useQueryState('dateFrom', { defaultValue: '' });
  const [dateTo, setDateTo] = useQueryState('dateTo', { defaultValue: '' });
  const [boat, setBoat] = useQueryState('boat', { defaultValue: '' });
  const [customer, setCustomer] = useQueryState('customer', { defaultValue: '' });

  // Create filters object for compatibility with existing components
  const filters = {
    search,
    status,
    type,
    dateFrom,
    dateTo,
    boat,
    customer,
  };

  // Active filter count for badge (exclude 'all' values and empty strings)
  const activeFilterCount = Object.values(filters).filter(value => 
    value && value !== '' && value !== 'all'
  ).length;


  // Simple tab change handler
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Simple apply filters handler
  const applyFilters = () => {
    setShowFilters(false);
  };

  // Simple clear filters handler
  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setType('all');
    setDateFrom('');
    setDateTo('');
    setBoat('');
    setCustomer('');
    setShowFilters(false);
  };

  // Render active tab content
  const renderTabContent = () => {
    const commonProps = {
      searchParams: {
        tab: activeTab,
        search,
        status,
        type,
        dateFrom,
        dateTo,
        boat,
        customer,
        ...searchParams // Include any additional params like page, limit
      },
      filters
    };

    switch (activeTab) {
      case "inquiries":
        return <InquiriesTab {...commonProps} inquiriesData={inquiriesData} />;
      case "calendar":
        return <CalendarTab {...commonProps} bookingsData={bookingsData} />;
      default:
        return <AllBookingsTab {...commonProps} bookingsData={bookingsData} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <nav className="flex space-x-8" aria-label="Booking tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Search and Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filter Button */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-blue-500"
                      variant="default"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Status
                    </label>
                    <Select
                      value={status}
                      onValueChange={setStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Booking Type
                    </label>
                    <Select
                      value={type}
                      onValueChange={setType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pb-4">
            <span className="text-sm text-gray-500">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {search && (
                <Badge variant="secondary" className="text-xs">
                  Search: {search}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearch('')}
                  />
                </Badge>
              )}
              {status && status !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {statusOptions.find(o => o.value === status)?.label}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setStatus('all')}
                  />
                </Badge>
              )}
              {type && type !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Type: {typeOptions.find(o => o.value === type)?.label}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setType('all')}
                  />
                </Badge>
              )}
              {(dateFrom || dateTo) && (
                <Badge variant="secondary" className="text-xs">
                  Date: {dateFrom || "∞"} - {dateTo || "∞"}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}