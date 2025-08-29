"use client";

import React from "react";
import { ArrowLeft, Menu, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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

interface InboxHeaderProps {
  selectedBooking: BookingData | undefined;
  activeView: "details" | "messages";
  onViewChange: (view: "details" | "messages") => void;
  onBackToBookings: () => void;
  onToggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export function InboxHeader({ 
  selectedBooking, 
  activeView,
  onViewChange,
  onBackToBookings,
  onToggleSidebar,
  isMobileSidebarOpen
}: InboxHeaderProps) {
  
  if (!selectedBooking) {
    // Header when no booking is selected
    return (
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Top Section - Booking Info */}
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackToBookings}
            className="h-8 w-8 p-0 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0 hidden md:block"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Booking Info */}
          <div className="flex items-center gap-3">
            <img 
              src={selectedBooking.yacht.image} 
              alt={selectedBooking.yacht.name}
              className="w-10 h-8 object-cover rounded border border-gray-200"
            />
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 truncate text-sm">
                {selectedBooking.yacht.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">#{selectedBooking.id}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    selectedBooking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedBooking.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    selectedBooking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    selectedBooking.status === 'completed' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Total Paid */}
        <div className="text-right">
          <div className="text-sm font-semibold text-blue-600">
            ${selectedBooking.totalPaid.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">Total paid</div>
        </div>
      </div>

      {/* Bottom Section - View Toggle */}
      <div className="px-4 pb-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange("details")}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all
              ${activeView === "details" 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            Trip Details
          </button>
          
          <button
            onClick={() => onViewChange("messages")}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all relative
              ${activeView === "messages" 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <MessageCircle className="w-4 h-4" />
            Messages
            {selectedBooking.lastMessage.unread && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
