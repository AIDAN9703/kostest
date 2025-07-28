"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { 
  Search, 
  MessageCircle, 
  Calendar, 
  User,
  Clock,
  Pin,
  Archive,
  Filter
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { 
  ConversationWithDetails, 
  ConversationListResponse
} from "@/shared/types/messaging.types";
import { format, isToday, isYesterday } from "date-fns";
import { ConversationListSkeleton } from "./ConversationListSkeleton";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  totalUnread: number;
  currentUserId: string;
  currentConversationId?: string;
  onConversationSelect?: (conversation: ConversationWithDetails) => void;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  className?: string;
}

export const ConversationList = React.memo(function ConversationList({ 
  conversations,
  totalUnread,
  currentUserId,
  currentConversationId,
  onConversationSelect,
  onSearchChange,
  loading = false,
  className 
}: ConversationListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Format relative time
  const formatRelativeTime = useCallback((date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  }, []);

  // Get conversation display name
  const getConversationDisplayName = useCallback((conversation: ConversationWithDetails) => {
    if (conversation.subject) {
      return conversation.subject;
    }
    
    if (conversation.booking) {
      return `${conversation.booking.boatName} - ${conversation.booking.customerName}`;
    }
    
    // Get participant names (excluding current user)
    const otherParticipants = conversation.participants.filter(p => p.userId !== currentUserId);
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.displayName || `${participant.firstName} ${participant.lastName}`.trim() || "Unknown User";
    } else if (otherParticipants.length > 1) {
      return `${otherParticipants.length} participants`;
    }
    
    return "New Conversation";
  }, [currentUserId]);

  // Get conversation preview text
  const getPreviewText = useCallback((conversation: ConversationWithDetails) => {
    if (conversation.lastMessage) {
      return conversation.lastMessage.content;
    }
    return "No messages yet";
  }, []);

  // Get conversation type badge
  const getTypeBadge = useCallback((type: string) => {
    const badges = {
      BOOKING: { label: "Booking", variant: "default" as const },
      GENERAL: { label: "General", variant: "secondary" as const },
      SUPPORT: { label: "Support", variant: "destructive" as const },
      ADMIN: { label: "Admin", variant: "outline" as const },
    };
    
    return badges[type as keyof typeof badges] || { label: type, variant: "secondary" as const };
  }, []);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conversation => {
      const displayName = getConversationDisplayName(conversation).toLowerCase();
      const previewText = getPreviewText(conversation).toLowerCase();
      return displayName.includes(query) || previewText.includes(query);
    });
  }, [conversations, searchQuery, getConversationDisplayName, getPreviewText]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  // Handle conversation selection
  const handleConversationClick = useCallback((conversation: ConversationWithDetails) => {
    if (onConversationSelect) {
      onConversationSelect(conversation);
    } else {
      router.push(`/messages/${conversation.id}`);
    }
  }, [onConversationSelect, router]);

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Messages
            {totalUnread > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {totalUnread}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <ConversationListSkeleton className="border-0 rounded-none" itemCount={6} />
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery 
                  ? "No conversations match your search. Try different keywords."
                  : "Start a new conversation to begin messaging."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === currentConversationId;
                const unreadCount = conversation.currentUserParticipant?.unreadCount || 0;
                const hasUnread = unreadCount > 0;
                const displayName = getConversationDisplayName(conversation);
                const previewText = getPreviewText(conversation);
                const typeBadge = getTypeBadge(conversation.type);

                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                      isActive && "bg-muted border-r-2 border-primary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback className="text-sm">
                          {conversation.type === 'BOOKING' ? (
                            <Calendar className="h-4 w-4" />
                          ) : (
                            displayName.slice(0, 2).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            hasUnread && "font-semibold"
                          )}>
                            {displayName}
                          </h4>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(new Date(conversation.lastMessageAt))}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Content row */}
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-sm text-muted-foreground truncate mr-2",
                            hasUnread && "font-medium text-foreground"
                          )}>
                            {previewText}
                          </p>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {hasUnread && (
                              <Badge variant="destructive" className="text-xs px-2 py-0.5 min-w-[20px] h-5 rounded-full">
                                {unreadCount}
                              </Badge>
                            )}
                            
                            {conversation.priority === 'HIGH' && (
                              <Pin className="h-3 w-3 text-destructive" />
                            )}
                            
                            {conversation.isArchived && (
                              <Archive className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        {/* Type badge and status */}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={typeBadge.variant} className="text-xs">
                            {typeBadge.label}
                          </Badge>
                          
                          {conversation.booking && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {conversation.booking.customerName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});