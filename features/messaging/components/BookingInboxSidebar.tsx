"use client";

import React, { useState } from "react";
import { Search, Filter, Star, Calendar, Users, MapPin } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";

interface BookingData {
  id: string;
  status: "confirmed" | "pending" | "upcoming" | "completed" | "cancelled";
  yacht: {
    name: string;
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
  };
  dates: {
    start: string;
    end: string;
    duration: string;
  };
  host: {
    name: string;
    avatar: string;
    responseTime: string;
  };
  captain: {
    name: string;
    avatar: string;
    included: boolean;
  };
  passengers: number;
  totalPaid: number;
  lastMessage: {
    content: string;
    timestamp: Date;
    unread: boolean;
  };
  daysUntil: number;
}

interface BookingInboxSidebarProps {
  bookings: BookingData[];
  selectedBookingId: string | null;
  onBookingSelect: (bookingId: string) => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "upcoming": return "bg-blue-100 text-blue-800 border-blue-200";
    case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
    case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

function BookingCard({ 
  booking, 
  isSelected, 
  onSelect 
}: { 
  booking: BookingData; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`
        p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50
        ${isSelected ? 'bg-blue-50 border-r-3 border-r-blue-600' : ''}
      `}
    >
      {/* Booking Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs font-medium ${getStatusColor(booking.status)}`}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
          {booking.daysUntil <= 7 && booking.status === "confirmed" && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              {booking.daysUntil} days
            </Badge>
          )}
        </div>
        <span className="text-xs text-gray-500">#{booking.id}</span>
      </div>

      {/* Yacht Image and Info */}
      <div className="flex gap-3 mb-3">
        <div className="shrink-0">
          <img 
            src={booking.yacht.image} 
            alt={booking.yacht.name}
            className="w-16 h-12 object-cover rounded-lg border border-gray-200"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {booking.yacht.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">{booking.yacht.location}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span className="text-xs text-gray-600">{booking.yacht.rating}</span>
            <span className="text-xs text-gray-400">({booking.yacht.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="w-3 h-3" />
          <span>{booking.dates.start}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Users className="w-3 h-3" />
          <span>{booking.passengers} passengers • {booking.dates.duration}</span>
        </div>
      </div>

      {/* Host and Total Paid */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-700">
          <span className="text-gray-500">Host:</span> {booking.host.name}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          ${booking.totalPaid.toFixed(0)}
        </span>
      </div>

      {/* Last Message */}
      {booking.lastMessage && (
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-xs truncate ${booking.lastMessage.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              {booking.lastMessage.content}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-gray-400">
              {formatTimestamp(booking.lastMessage.timestamp)}
            </span>
            {booking.lastMessage.unread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BookingInboxSidebar({ 
  bookings, 
  selectedBookingId, 
  onBookingSelect 
}: BookingInboxSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "pending" | "completed">("all");

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.yacht.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "upcoming" && (booking.status === "confirmed" || booking.status === "upcoming")) ||
      (statusFilter === "pending" && booking.status === "pending") ||
      (statusFilter === "completed" && booking.status === "completed");

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: bookings.length,
    upcoming: bookings.filter(b => b.status === "confirmed" || b.status === "upcoming").length,
    pending: bookings.filter(b => b.status === "pending").length,
    completed: bookings.filter(b => b.status === "completed").length
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
          <Filter className="w-5 h-5 text-gray-400" />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-gray-50 border-gray-200 focus:bg-white text-sm"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1">
          {[
            { key: "all", label: "All" },
            { key: "upcoming", label: "Upcoming" },
            { key: "pending", label: "Pending" },
            { key: "completed", label: "Past" }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key as any)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${statusFilter === filter.key 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {filter.label}
              {statusCounts[filter.key as keyof typeof statusCounts] > 0 && (
                <span className="ml-1">
                  ({statusCounts[filter.key as keyof typeof statusCounts]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-y-auto">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'Your bookings will appear here'}
            </p>
          </div>
        ) : (
          <div>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isSelected={selectedBookingId === booking.id}
                onSelect={() => onBookingSelect(booking.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
