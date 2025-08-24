"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Calendar, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

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

interface BookingMessagesViewProps {
  booking: BookingData | undefined;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  senderType: "guest" | "host" | "system";
  type: "text" | "system";
}

// Mock messages from GUEST perspective - messages about their booked trip
const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hi! I'm excited about the charter. What time should I arrive at the marina?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    senderId: "guest-1",
    senderName: "You",
    senderType: "guest",
    type: "text"
  },
  {
    id: "2", 
    content: "Hello! Please arrive at 11:45 AM for a 12:00 PM departure. I'll meet you at the dock for a quick safety briefing.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
    senderId: "host-1", 
    senderName: "Brittany",
    senderType: "host",
    type: "text"
  },
  {
    id: "3",
    content: "Perfect! Should I bring anything specific? Also, what's the weather looking like?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
    senderId: "guest-1",
    senderName: "You", 
    senderType: "guest",
    type: "text"
  },
  {
    id: "4",
    content: "Just bring sunscreen, a hat, and comfortable clothes. We provide life jackets and all safety equipment. Weather looks great - sunny with light winds! 🌞",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21),
    senderId: "host-1",
    senderName: "Brittany",
    senderType: "host", 
    type: "text"
  },
  {
    id: "5",
    content: "Booking confirmed for Ultimate Fun on Water: 27ft Tri-Hull - 4 hour charter on Apr 18, 2025",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
    senderId: "system",
    senderName: "System",
    senderType: "system",
    type: "system"
  },
  {
    id: "6",
    content: "Awesome! Thanks for all the details. My group is really looking forward to it! 🎉",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19),
    senderId: "guest-1",
    senderName: "You",
    senderType: "guest",
    type: "text"
  }
];

function formatMessageTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-full max-w-md text-center border border-blue-200">
          {message.content}
        </div>
      </div>
    );
  }

  const isOwn = message.senderType === "guest";

  return (
    <div className={`flex gap-3 mb-6 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
          isOwn ? 'bg-gray-900' : 'bg-blue-500'
        }`}>
          {message.senderName.charAt(0)}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name */}
        <span className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {message.senderName}
        </span>

        {/* Message Bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl break-words text-sm leading-relaxed
            ${isOwn 
              ? 'bg-gray-900 text-white rounded-br-md' 
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }
          `}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatMessageTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

export function BookingMessagesView({ booking }: BookingMessagesViewProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement actual message sending
      console.log('Sending message:', message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Send className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a booking</h3>
          <p className="text-gray-600 leading-relaxed">
            Choose a booking from the sidebar to start messaging with your renter about their charter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Charter Context Header */}
      <div className="bg-blue-50 border-b border-blue-100 p-4">
        <div className="flex items-center gap-3">
          <img 
            src={booking.yacht.image} 
            alt={booking.yacht.name}
            className="w-12 h-12 object-cover rounded-lg border border-blue-200"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-blue-900 truncate">
              {booking.yacht.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-blue-700">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{booking.dates.start}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{booking.yacht.location}</span>
              </div>
            </div>
          </div>
                      <div className="text-right">
              <div className="text-sm font-semibold text-blue-900">#{booking.id}</div>
              <div className="text-xs text-blue-600">Host: {booking.host.name}</div>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {mockMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Composer */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {/* Attachment Button */}
            <Button variant="ghost" size="sm" className="flex-shrink-0 text-gray-500">
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Text Input */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[20px] max-h-32 resize-none border-0 bg-transparent p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0"
                style={{ height: 'auto' }}
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
