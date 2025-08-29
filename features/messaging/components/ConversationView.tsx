"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { 
  ArrowLeft, 
  MoreVertical, 
  Settings, 
  Archive,
  VolumeX,
  Volume2,
  Calendar,
  Users,
  Lock,
  Unlock,
  Flag
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { 
  ConversationWithDetails, 
  MessageWithDetails 
} from "@/shared/types/messaging.types";
import { getConversation } from "@/features/messaging/actions";
import { useMessagingSocket } from "@/features/messaging/services/socket";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { format } from "date-fns";

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  initialConversation?: ConversationWithDetails;
  onBack?: () => void;
  className?: string;
}

export function ConversationView({ 
  conversationId, 
  currentUserId,
  initialConversation,
  onBack,
  className 
}: ConversationViewProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(
    initialConversation || null
  );
  const [loading, setLoading] = useState(!initialConversation);
  
  const { joinConversation, leaveConversation } = useMessagingSocket();

  // Load conversation details
  const loadConversation = async () => {
    try {
      setLoading(true);
      const result = await getConversation(conversationId);
      
      if (result.success) {
        setConversation(result.data);
      } else {
        console.error("Failed to load conversation:", result.error);
        // TODO: Show error message or redirect
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Join conversation room on mount
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      
      if (!initialConversation) {
        loadConversation();
      }
    }
    
    return () => {
      leaveConversation();
    };
  }, [conversationId]);

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/messages');
    }
  };

  // Get conversation display name
  const getConversationDisplayName = (conv: ConversationWithDetails) => {
    if (conv.subject) {
      return conv.subject;
    }
    
    if (conv.booking) {
      return `${conv.booking.boatName}`;
    }
    
    // Get other participants (excluding current user)
    const otherParticipants = conv.participants.filter(p => p.userId !== currentUserId);
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.displayName || `${participant.firstName} ${participant.lastName}`.trim() || "Unknown User";
    } else if (otherParticipants.length > 1) {
      return `Group Chat (${otherParticipants.length + 1})`;
    }
    
    return "Conversation";
  };

  // Get conversation subtitle
  const getConversationSubtitle = (conv: ConversationWithDetails) => {
    if (conv.booking) {
      return `Booking • ${format(conv.booking.startDateTime, "MMM d, yyyy")}`;
    }
    
    const otherParticipants = conv.participants.filter(p => p.userId !== currentUserId);
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.status === "ACTIVE" ? "Active" : "Offline";
    } else if (otherParticipants.length > 1) {
      const activeCount = otherParticipants.filter(p => p.status === "ACTIVE").length;
      return `${activeCount} of ${otherParticipants.length} active`;
    }
    
    return conv.type.toLowerCase().replace('_', ' ');
  };

  // Get conversation type badge
  const getTypeBadge = (type: string) => {
    const badges = {
      BOOKING: { label: "Booking", variant: "default" as const, color: "bg-blue-500" },
      GENERAL: { label: "General", variant: "secondary" as const, color: "bg-gray-500" },
      SUPPORT: { label: "Support", variant: "destructive" as const, color: "bg-red-500" },
      ADMIN: { label: "Admin", variant: "outline" as const, color: "bg-purple-500" },
    };
    
    return badges[type as keyof typeof badges] || { label: type, variant: "secondary" as const, color: "bg-gray-500" };
  };

  if (loading || !conversation) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <Card className="flex-1">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="animate-pulse flex items-center gap-3 flex-1">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div>
                  <div className="h-4 bg-muted rounded w-32 mb-2" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading conversation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeBadge = getTypeBadge(conversation.type);
  const currentUserParticipant = conversation.currentUserParticipant;
  const [activeTab, setActiveTab] = useState<'messages'|'details'>('messages');

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Conversation Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Conversation info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              {conversation.booking ? (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage 
                    src={conversation.participants.find(p => p.userId !== currentUserId)?.profileImage} 
                  />
                  <AvatarFallback>
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Name and status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">
                    {getConversationDisplayName(conversation)}
                  </h3>
                  <Badge variant={typeBadge.variant} className="text-xs">
                    {typeBadge.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getConversationSubtitle(conversation)}
                </p>
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-1">
              {conversation.priority === "HIGH" && (
                <Badge variant="destructive" className="text-xs">
                  High Priority
                </Badge>
              )}
              {conversation.isLocked && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              {currentUserParticipant?.isMuted && (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              {currentUserParticipant?.isArchived && (
                <Archive className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Actions menu */}
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Booking details */}
          {conversation.booking && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{conversation.booking.boatName}</p>
                  <p className="text-sm text-muted-foreground">
                    {conversation.booking.customerName} • {format(conversation.booking.startDateTime, "MMMM d, yyyy")}
                  </p>
                </div>
                <Badge variant={
                  conversation.booking.bookingStatus === "CONFIRMED" ? "default" :
                  conversation.booking.bookingStatus === "PENDING" ? "secondary" :
                  "outline"
                }>
                  {conversation.booking.bookingStatus}
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      <Separator />

      {/* Toggle */}
      <div className="px-4 py-2 flex gap-2 border-b">
        <Button variant={activeTab==='messages'? 'default':'outline'} size="sm" onClick={() => setActiveTab('messages')}>Messages</Button>
        <Button variant={activeTab==='details'? 'default':'outline'} size="sm" onClick={() => setActiveTab('details')}>{conversation.type === 'BOOKING' ? 'Booking Details' : 'Inquiry Details'}</Button>
      </div>

      {/* Content */}
      {activeTab === 'messages' ? (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList
              conversation={conversation}
              currentUserId={currentUserId}
              className="border-0 rounded-none h-full"
            />
          </div>
          <MessageComposer
            conversation={conversation}
            onMessageSent={() => {}}
            className="border-t-0"
          />
        </>
      ) : (
        <div className="p-6 text-sm text-slate-700">
          {conversation.booking ? (
            <div className="space-y-3">
              <div className="font-medium text-slate-900">Booking</div>
              <div>Boat: {conversation.booking.boatName}</div>
              <div>Customer: {conversation.booking.customerName}</div>
              <div>Date: {format(conversation.booking.startDateTime, 'MMMM d, yyyy')}</div>
              <div>Status: {conversation.booking.bookingStatus}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="font-medium text-slate-900">Inquiry</div>
              <div>Participants: {conversation.participants.length}</div>
              <div>Subject: {conversation.subject || 'General inquiry'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}