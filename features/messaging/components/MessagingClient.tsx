"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { 
  PanelLeftClose, 
  PanelLeftOpen,
  MessageSquarePlus
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { 
  ConversationListResponse 
} from "@/shared/types/messaging";
import { useMessagingSocket } from "@/features/messaging/hooks/useMessagingSocket";
import { ConversationList } from "./ConversationList";

interface MessagingClientProps {
  currentUserId: string;
  initialConversations?: ConversationListResponse;
  children: React.ReactNode;
}

export const MessagingClient = React.memo(function MessagingClient({ 
  currentUserId,
  initialConversations,
  children 
}: MessagingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { connect, isConnected, error } = useMessagingSocket();
  
  // Use ref to track if we've attempted connection to prevent multiple attempts
  const connectionAttemptedRef = useRef(false);
  const connectRef = useRef(connect);
  connectRef.current = connect;

  // Extract conversation ID from pathname
  const conversationId = useMemo(() => {
    return pathname.match(/\/messages\/([^\/]+)/)?.[1];
  }, [pathname]);

  // Memoize derived state to prevent unnecessary re-renders
  const isConversationPage = useMemo(() => Boolean(conversationId), [conversationId]);
  const showMobileList = useMemo(() => !isConversationPage, [isConversationPage]);

  // Memoize conversation data to prevent ConversationList re-renders
  const conversationData = useMemo(() => ({
    conversations: initialConversations?.conversations || [],
    totalUnread: initialConversations?.totalUnread || 0
  }), [initialConversations?.conversations, initialConversations?.totalUnread]);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Connect to messaging socket - COMPLETELY stable dependencies
  useEffect(() => {
    if (currentUserId && !isConnected && !connectionAttemptedRef.current) {
      connectionAttemptedRef.current = true;
      connectRef.current(currentUserId);
    }
    
    // Reset attempt flag if connection state changes
    if (isConnected) {
      connectionAttemptedRef.current = false;
    }
  }, [currentUserId, isConnected]); // Completely stable dependencies

  // Handle conversation selection
  const handleConversationSelect = useCallback((conversation: any) => {
    const id = typeof conversation === 'string' ? conversation : conversation.id;
    router.push(`/messages/${id}`);
  }, [router]);

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    // TODO: Open new conversation modal/form
    console.log("New conversation");
  }, []);

  // Show error if socket connection fails
  if (error) {
    console.warn('Messaging socket error:', error);
  }

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="h-screen flex bg-background">
        {/* Sidebar */}
        <div className={cn(
          "border-r bg-card transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-80"
        )}>
          {/* Sidebar header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h1 className="text-xl font-semibold">Messages</h1>
              )}
              
              <div className="flex gap-2">
                {!sidebarCollapsed && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleNewConversation}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Conversation list */}
          {!sidebarCollapsed && (
            <div className="h-[calc(100vh-73px)]">
              <ConversationList
                conversations={conversationData.conversations}
                totalUnread={conversationData.totalUnread}
                currentUserId={currentUserId}
                currentConversationId={conversationId}
                onConversationSelect={handleConversationSelect}
                className="h-full border-0 rounded-none"
              />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
         {children}
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="h-screen bg-background">
      {showMobileList ? (
        /* Mobile conversation list */
        <div className="h-full flex flex-col">
          {/* Mobile header */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Messages</h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleNewConversation}
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1">
            <ConversationList
              conversations={conversationData.conversations}
              totalUnread={conversationData.totalUnread}
              currentUserId={currentUserId}
              currentConversationId={conversationId}
              onConversationSelect={handleConversationSelect}
              className="h-full border-0 rounded-none"
            />
          </div>
        </div>
      ) : (
        /* Mobile conversation view */
        <div className="h-full relative">
          {children}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom memo comparison to prevent unnecessary re-renders
  return (
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.initialConversations?.conversations?.length === nextProps.initialConversations?.conversations?.length &&
    prevProps.initialConversations?.totalUnread === nextProps.initialConversations?.totalUnread
  );
}); 