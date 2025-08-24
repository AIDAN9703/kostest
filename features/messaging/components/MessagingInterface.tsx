"use client";

import React, { useState } from "react";
import { BookingInboxSidebar } from "@/features/messaging/components/BookingInboxSidebar";
import { BookingDetailsView } from "@/features/messaging/components/BookingDetailsView";
import { BookingMessagesView } from "@/features/messaging/components/BookingMessagesView";
import { InboxHeader } from "@/features/messaging/components/InboxHeader";

/* 
TODO: Integration Notes for Real Messaging System

1. STATE MANAGEMENT:
   - Replace useState with real conversation state (Redux/Zustand)
   - Connect to WebSocket for real-time updates
   - Implement optimistic updates for messages

2. DATA FETCHING:
   - Replace mock data with real API calls
   - Implement pagination for conversations and messages
   - Add search functionality for conversations

3. REAL-TIME FEATURES:
   - WebSocket connection for live messaging
   - Typing indicators
   - Online status indicators
   - Message read receipts

4. AUTHENTICATION:
   - Pass real user data from session
   - Implement permission checks for conversations

5. NOTIFICATIONS:
   - Push notifications for new messages
   - Sound notifications
   - Desktop notifications

Example integration:
```tsx
const { conversations, selectedConversation } = useMessaging();
const { sendMessage, markAsRead } = useMessagingActions();
```
*/

// Mock booking data from RENTER perspective - trips the user has booked
const mockBookings = [
  {
    id: "RCDZRCH",
    status: "confirmed" as const,
    yacht: {
      name: "Ultimate Fun on Water: 27ft Tri-Hull",
      image: "/images/boats/yacht1.png",
      location: "Fort Lauderdale, FL",
      rating: 5.0,
      reviewCount: 12
    },
    dates: {
      start: "Apr 18, 2025 • 12:00 PM",
      end: "Apr 18, 2025 • 4:00 PM",
      duration: "4 hours"
    },
    host: {
      name: "Brittany",
      avatar: "/images/team/host-brittany.jpg",
      responseTime: "Usually responds within an hour"
    },
    captain: {
      name: "Captain Mike Johnson",
      avatar: "/images/team/captain-mike.png",
      included: true
    },
    passengers: 9,
    totalPaid: 475.00,
    lastMessage: {
      content: "Perfect! I'll have the boat ready at 12:00 PM sharp. Looking forward to your charter!",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      unread: true
    },
    daysUntil: 2
  },
  {
    id: "BWX789",
    status: "upcoming" as const,
    yacht: {
      name: "Luxury Yacht Experience: 45ft Motor Yacht",
      image: "/images/boats/yacht-2.jpg", 
      location: "Miami Beach, FL",
      rating: 4.8,
      reviewCount: 24
    },
    dates: {
      start: "Apr 20, 2025 • 10:00 AM",
      end: "Apr 20, 2025 • 6:00 PM", 
      duration: "8 hours"
    },
    host: {
      name: "Sarah Wilson",
      avatar: "/images/team/sarah.jpg",
      responseTime: "Usually responds within 2 hours"
    },
    captain: {
      name: "Captain Rodriguez",
      avatar: "/images/team/captain-rodriguez.jpg",
      included: true
    },
    passengers: 6,
    totalPaid: 950.00,
    lastMessage: {
      content: "Thanks for booking! I'll send you check-in details closer to your trip date.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unread: false
    },
    daysUntil: 4
  },
  {
    id: "ABC123", 
    status: "pending" as const,
    yacht: {
      name: "Sea Adventure: 35ft Sport Fisher",
      image: "/images/boats/yacht-3.jpg",
      location: "Key Biscayne, FL", 
      rating: 4.9,
      reviewCount: 18
    },
    dates: {
      start: "Apr 25, 2025 • 8:00 AM",
      end: "Apr 25, 2025 • 4:00 PM",
      duration: "8 hours"
    },
    host: {
      name: "Captain Rodriguez",
      avatar: "/images/team/captain-rodriguez.jpg",
      responseTime: "Usually responds within 30 minutes"
    },
    captain: {
      name: "Captain Rodriguez",
      avatar: "/images/team/captain-rodriguez.jpg",
      included: true
    },
    passengers: 4,
    totalPaid: 780.00,
    lastMessage: {
      content: "Thanks for your inquiry! I'll review your request and get back to you within 24 hours.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      unread: true
    },
    daysUntil: 9
  },
  {
    id: "XYZ456",
    status: "completed" as const,
    yacht: {
      name: "Miami Sunset Cruiser: 40ft Catamaran",
      image: "/images/boats/yacht-4.jpg",
      location: "Miami, FL",
      rating: 4.7,
      reviewCount: 31
    },
    dates: {
      start: "Mar 15, 2025 • 6:00 PM",
      end: "Mar 15, 2025 • 9:00 PM",
      duration: "3 hours"
    },
    host: {
      name: "Michael Torres",
      avatar: "/images/team/michael.jpg",
      responseTime: "Usually responds within an hour"
    },
    captain: {
      name: "Captain Torres",
      avatar: "/images/team/michael.jpg",
      included: true
    },
    passengers: 8,
    totalPaid: 425.00,
    lastMessage: {
      content: "Hope you had an amazing sunset cruise! Would love to have you back anytime.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      unread: false
    },
    daysUntil: -5
  }
];

export function MessagingInterface() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"details" | "messages">("details");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const selectedBooking = mockBookings.find(booking => booking.id === selectedBookingId);

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsMobileSidebarOpen(false);
  };

  const handleBackToBookings = () => {
    setSelectedBookingId(null);
    setIsMobileSidebarOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <InboxHeader 
        selectedBooking={selectedBooking}
        activeView={activeView}
        onViewChange={setActiveView}
        onBackToBookings={handleBackToBookings}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Booking Sidebar */}
        <div className={`
          ${isMobileSidebarOpen || !selectedBookingId ? 'block' : 'hidden'} 
          md:block w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white
          ${selectedBookingId ? 'md:block' : 'block'}
        `}>
          <BookingInboxSidebar
            bookings={mockBookings}
            selectedBookingId={selectedBookingId}
            onBookingSelect={handleBookingSelect}
          />
        </div>

        {/* Content Area */}
        <div className={`
          flex-1 flex flex-col bg-white
          ${selectedBookingId && !isMobileSidebarOpen ? 'block' : 'hidden md:flex'}
        `}>
          {activeView === "details" ? (
            <BookingDetailsView booking={selectedBooking} />
          ) : (
            <BookingMessagesView booking={selectedBooking} />
          )}
        </div>
      </div>
    </div>
  );
}
