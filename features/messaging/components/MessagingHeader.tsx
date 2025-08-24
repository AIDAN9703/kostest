"use client";

import React from "react";
import { ArrowLeft, Menu, Phone, Video, MoreVertical, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface Participant {
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
  role: "Captain" | "Boat Owner" | "Support" | "Guest";
}

interface Message {
  content: string;
  timestamp: Date;
  isRead: boolean;
  senderId: string;
}

interface Conversation {
  id: string;
  participant: Participant;
  lastMessage: Message;
  unreadCount: number;
  bookingId: string | null;
  boatName: string | null;
}

interface MessagingHeaderProps {
  selectedConversation: Conversation | undefined;
  onBackToConversations: () => void;
  onToggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

function getRoleColor(role: string): string {
  switch (role) {
    case "Captain": return "bg-blue-100 text-blue-700";
    case "Boat Owner": return "bg-emerald-100 text-emerald-700";
    case "Support": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Active now";
  if (minutes < 60) return `Active ${minutes}m ago`;
  if (hours < 24) return `Active ${hours}h ago`;
  if (days < 7) return `Active ${days}d ago`;
  return `Active ${date.toLocaleDateString()}`;
}

export function MessagingHeader({ 
  selectedConversation, 
  onBackToConversations,
  onToggleSidebar,
  isMobileSidebarOpen
}: MessagingHeaderProps) {
  
  if (!selectedConversation) {
    // Header when no conversation is selected
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
          <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        </div>
      </div>
    );
  }

  const { participant, boatName } = selectedConversation;

  return (
    <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackToConversations}
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

        {/* Participant Info */}
        <div className="flex items-center gap-3">
          {/* Avatar with Status */}
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={participant.avatar} alt={participant.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold text-sm">
                {participant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {participant.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Name and Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 truncate">{participant.name}</h2>
              <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getRoleColor(participant.role)} hidden sm:inline-flex`}>
                {participant.role}
              </Badge>
            </div>
            
            {/* Status and Boat Name */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                {participant.isOnline ? "Online" : participant.lastSeen ? formatLastSeen(participant.lastSeen) : "Offline"}
              </span>
              {boatName && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">⛵ {boatName}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        {/* Call Actions */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hidden sm:flex"
          title="Voice call"
        >
          <Phone className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hidden sm:flex"
          title="Video call"
        >
          <Video className="h-4 w-4" />
        </Button>

        {/* Info Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          title="Conversation info"
        >
          <Info className="h-4 w-4" />
        </Button>

        {/* More Options */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          title="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
