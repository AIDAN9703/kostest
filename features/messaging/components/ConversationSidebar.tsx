"use client";

import React, { useState } from "react";
import { Search, Plus, MoreVertical, Star, Archive, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
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

function getRoleColor(role: string): string {
  switch (role) {
    case "Captain": return "bg-blue-100 text-blue-700";
    case "Boat Owner": return "bg-emerald-100 text-emerald-700";
    case "Support": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function ConversationItem({ 
  conversation, 
  isSelected, 
  onSelect 
}: { 
  conversation: Conversation; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const { participant, lastMessage, unreadCount, boatName } = conversation;

  return (
    <div
      onClick={onSelect}
      className={`
        p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50
        ${isSelected ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with Online Status */}
        <div className="relative shrink-0">
          <Avatar className="w-12 h-12">
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-white font-semibold">
              {participant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {participant.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Conversation Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                {participant.name}
              </h3>
              <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getRoleColor(participant.role)}`}>
                {participant.role}
              </Badge>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-gray-500">
                {formatTimestamp(lastMessage.timestamp)}
              </span>
              {unreadCount > 0 && (
                <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
          </div>

          {/* Boat Name */}
          {boatName && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-blue-600 font-medium">⛵ {boatName}</span>
            </div>
          )}

          {/* Last Message Preview */}
          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
            {lastMessage.content}
          </p>

          {/* Online Status Text */}
          {!participant.isOnline && participant.lastSeen && (
            <p className="text-xs text-gray-400 mt-1">
              Last seen {formatTimestamp(participant.lastSeen)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConversationSidebar({ 
  conversations, 
  selectedConversationId, 
  onConversationSelect 
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "captains" | "owners">("all");

  // Filter conversations based on search and filter
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (conv.boatName && conv.boatName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = (() => {
      switch (filter) {
        case "unread": return conv.unreadCount > 0;
        case "captains": return conv.participant.role === "Captain";
        case "owners": return conv.participant.role === "Boat Owner";
        default: return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            {totalUnread > 0 && (
              <Badge variant="default" className="bg-blue-500 text-white">
                {totalUnread}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {[
            { key: "all", label: "All", count: conversations.length },
            { key: "unread", label: "Unread", count: totalUnread },
            { key: "captains", label: "Captains", count: conversations.filter(c => c.participant.role === "Captain").length },
            { key: "owners", label: "Owners", count: conversations.filter(c => c.participant.role === "Boat Owner").length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                ${filter === tab.key 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'Start a conversation to get connected'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onSelect={() => onConversationSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs">
            <Archive className="h-3 w-3 mr-1" />
            Archived
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Starred
          </Button>
        </div>
      </div>
    </div>
  );
}
