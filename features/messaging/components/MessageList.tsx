"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { 
  Check, 
  CheckCheck, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { 
  MessageWithDetails, 
  ConversationWithDetails,
  MessageType,
  TypingIndicator
} from "@/shared/types/messaging.types";
import { getMessages, markAsRead } from "@/features/messaging/actions";
import { useMessagingSocket, useMessagingEvents } from "@/features/messaging/services/socket";
import { format, formatDistanceToNow, isSameDay } from "date-fns";

interface MessageListProps {
  conversation: ConversationWithDetails;
  currentUserId: string;
  className?: string;
}

export function MessageList({ 
  conversation, 
  currentUserId, 
  className
}: MessageListProps) {
  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { markAsRead: socketMarkAsRead } = useMessagingSocket();
  const messagingEvents = useMessagingEvents();

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'instant' 
    });
  };

  // Load messages
  const loadMessages = async (pageNum = 1, append = false) => {
    try {
      setLoading(!append);
      const result = await getMessages(
        conversation.id,
        { conversationId: conversation.id },
        { page: pageNum, limit: 50 }
      );
      
      if ('messages' in result) {
        const newMessages = result.messages.reverse(); // API returns newest first, we want oldest first
        
        if (append) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
          // Scroll to bottom on initial load
          setTimeout(() => scrollToBottom(false), 100);
        }
        
        setHasMore(result.pagination.hasMore);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as read when conversation is viewed
  const markConversationAsRead = async () => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    await markAsRead({ 
      conversationId: conversation.id, 
      messageId: lastMessage.id 
    });
  };

  // Real-time event handlers
  useEffect(() => {
    // Handle new messages
    const handleNewMessage = messagingEvents.onNewMessage((event) => {
      const { message, conversation } = event.detail;
      
      if (conversation.id === conversation.id) {
        setMessages(prev => [...prev, message]);
        
        // Auto-scroll if user is near bottom
        const scrollArea = scrollAreaRef.current;
        if (scrollArea) {
          const { scrollTop, scrollHeight, clientHeight } = scrollArea;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
          
          if (isNearBottom) {
            setTimeout(() => scrollToBottom(), 100);
          }
        }
        
        // Mark as read if message is from someone else
        if (message.senderId !== currentUserId) {
          setTimeout(() => {
            socketMarkAsRead(conversation.id, message.id);
            markConversationAsRead();
          }, 1000);
        }
      }
    });

    // Handle typing indicators
    const handleTyping = messagingEvents.onTypingIndicator((event: CustomEvent<TypingIndicator>) => {
      const { userId, conversationId, isTyping } = event.detail;
      
      if (conversationId === conversation.id && userId !== currentUserId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    });

    // Handle message read receipts
    const handleMessageRead = messagingEvents.onMessageRead((event) => {
      const { messageId, userId, conversationId } = event.detail;
      
      if (conversationId === conversation.id) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              readBy: {
                ...msg.readBy,
                [userId]: event.detail.readAt
              },
              readCount: msg.readCount + 1
            };
          }
          return msg;
        }));
      }
    });

    return () => {
      handleNewMessage();
      handleTyping();
      handleMessageRead();
    };
  }, [conversation.id, currentUserId, messagingEvents]);

  // Load messages on conversation change
  useEffect(() => {
    setMessages([]);
    setPage(1);
    loadMessages(1);
  }, [conversation.id]);

  // Mark as read when messages change
  useEffect(() => {
    if (messages.length > 0) {
      markConversationAsRead();
    }
  }, [messages.length]);

  // Load more messages on scroll to top
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    
    if (scrollTop === 0 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage, true);
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (message: MessageWithDetails) => {
    if (message.senderId !== currentUserId) return null;
    
    const readByOthers = Object.keys(message.readBy).filter(userId => userId !== currentUserId).length;
    
    if (readByOthers > 0) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (message.status === "DELIVERED") {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  // Get system message icon
  const getSystemMessageIcon = (messageType: MessageType) => {
    const icons = {
      BOOKING_UPDATE: <Calendar className="h-4 w-4 text-blue-500" />,
      PAYMENT_UPDATE: <CreditCard className="h-4 w-4 text-green-500" />,
      SYSTEM: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      TEXT: null,
      IMAGE: null,
      DOCUMENT: null,
    };
    
    return icons[messageType];
  };

  // Check if we should show date separator
  const shouldShowDateSeparator = (currentMessage: MessageWithDetails, prevMessage?: MessageWithDetails) => {
    if (!prevMessage) return true;
    return !isSameDay(currentMessage.createdAt, prevMessage.createdAt);
  };

  // Format message time
  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  // Get typing users display
  const getTypingDisplay = () => {
    if (typingUsers.size === 0) return null;
    
    const userNames = Array.from(typingUsers).map(userId => {
      const participant = conversation.participants.find(p => p.userId === userId);
      return participant?.displayName || participant?.firstName || "Someone";
    });
    
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`;
    } else {
      return `${userNames.length} people are typing...`;
    }
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
      >
        {/* Loading more messages indicator */}
        {loading && page > 1 && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              Loading more messages...
            </div>
          </div>
        )}

        {/* Initial loading */}
        {loading && page === 1 ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={cn(
                "flex gap-3",
                i % 3 === 0 ? "justify-end" : "justify-start"
              )}>
                {i % 3 !== 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                <div className="space-y-2 max-w-xs">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : undefined;
              const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
              const isOwn = message.senderId === currentUserId;
              const isSystem = ['SYSTEM', 'BOOKING_UPDATE', 'PAYMENT_UPDATE'].includes(message.messageType);
              
              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <Badge variant="outline" className="text-xs">
                        {format(message.createdAt, 'EEEE, MMMM d, yyyy')}
                      </Badge>
                    </div>
                  )}

                  {/* System messages */}
                  {isSystem ? (
                    <div className="flex justify-center my-4">
                      <div className="bg-muted/50 rounded-lg px-4 py-2 max-w-md text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {getSystemMessageIcon(message.messageType)}
                          <span className="text-xs font-medium text-muted-foreground">
                            System Message
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Regular messages */
                    <div className={cn(
                      "flex gap-3 group",
                      isOwn ? "justify-end" : "justify-start"
                    )}>
                      {/* Avatar for others' messages */}
                      {!isOwn && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage 
                                  src={message.sender.profileImage} 
                                  alt={message.sender.displayName || "User"} 
                                />
                                <AvatarFallback className="text-xs">
                                  {(message.sender.firstName?.[0] || '') + (message.sender.lastName?.[0] || '')}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{message.sender.displayName || `${message.sender.firstName} ${message.sender.lastName}`}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Message content */}
                      <div className={cn(
                        "max-w-xs lg:max-w-md xl:max-w-lg",
                        isOwn && "order-first"
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 py-2 text-sm",
                          isOwn 
                            ? "bg-primary text-primary-foreground ml-auto" 
                            : "bg-muted"
                        )}>
                          {/* Sender name for group conversations */}
                          {!isOwn && conversation.participants.length > 2 && (
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {message.sender.displayName || `${message.sender.firstName} ${message.sender.lastName}`}
                            </p>
                          )}
                          
                          {/* Message content */}
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>

                          {/* Message attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, i) => (
                                <div 
                                  key={i}
                                  className="bg-background/10 rounded p-2 text-xs"
                                >
                                  📎 {attachment.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message metadata */}
                        <div className={cn(
                          "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                          isOwn ? "justify-end" : "justify-start"
                        )}>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {message.isEdited && (
                            <>
                              <span>•</span>
                              <span>edited</span>
                            </>
                          )}
                          {getMessageStatusIcon(message)}
                        </div>

                        {/* Message actions */}
                        {isOwn && (
                          <div className={cn(
                            "opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-right"
                          )}>
                            <div className="inline-flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    <div className="animate-pulse">💬</div>
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-2 max-w-xs">
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTypingDisplay()}
                  </p>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}