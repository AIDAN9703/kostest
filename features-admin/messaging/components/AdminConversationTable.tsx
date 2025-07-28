"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  MessageSquare,
  Calendar,
  Users,
  Archive,
  Lock,
  Unlock,
  Flag,
  Eye,
  Settings
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { 
  ConversationWithDetails, 
  ConversationListResponse,
  ConversationFilters 
} from "@/shared/types/messaging.types";
import { getConversations, adminUpdateConversation } from "@/features/messaging/actions";
import { format, formatDistanceToNow } from "date-fns";

interface AdminConversationTableProps {
  initialData?: ConversationListResponse;
  className?: string;
}

export function AdminConversationTable({ 
  initialData, 
  className 
}: AdminConversationTableProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    initialData?.conversations || []
  );
  const [totalUnread, setTotalUnread] = useState(initialData?.totalUnread || 0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Load conversations with filters
  const loadConversations = async () => {
    setLoading(true);
    try {
      const filters: ConversationFilters = {
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? [statusFilter as any] : undefined,
        type: typeFilter !== "all" ? [typeFilter as any] : undefined,
        priority: priorityFilter !== "all" ? [priorityFilter as any] : undefined,
      };

      const result = await getConversations(filters, { page: 1, limit: 100 });
      
      if ('conversations' in result) {
        setConversations(result.conversations);
        setTotalUnread(result.totalUnread);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    loadConversations();
  };

  // Handle conversation view
  const handleViewConversation = (conversation: ConversationWithDetails) => {
    router.push(`/admin/messages/${conversation.id}`);
  };

  // Handle status update
  const handleStatusUpdate = async (conversationId: string, status: string) => {
    try {
      const result = await adminUpdateConversation(conversationId, {
        status: status as any
      });

      if (result.success) {
        // Update local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId ? { ...conv, status: status as any } : conv
        ));
      }
    } catch (error) {
      console.error("Failed to update conversation status:", error);
    }
  };

  // Handle priority update
  const handlePriorityUpdate = async (conversationId: string, priority: string) => {
    try {
      const result = await adminUpdateConversation(conversationId, {
        priority: priority as any
      });

      if (result.success) {
        // Update local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId ? { ...conv, priority: priority as any } : conv
        ));
      }
    } catch (error) {
      console.error("Failed to update conversation priority:", error);
    }
  };

  // Handle lock/unlock
  const handleLockToggle = async (conversationId: string, isLocked: boolean) => {
    try {
      const result = await adminUpdateConversation(conversationId, {
        isLocked: !isLocked
      });

      if (result.success) {
        // Update local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId ? { ...conv, isLocked: !isLocked } : conv
        ));
      }
    } catch (error) {
      console.error("Failed to toggle conversation lock:", error);
    }
  };

  // Get conversation display name
  const getConversationDisplayName = (conversation: ConversationWithDetails) => {
    if (conversation.subject) {
      return conversation.subject;
    }
    
    if (conversation.booking) {
      return `${conversation.booking.boatName} - ${conversation.booking.customerName}`;
    }
    
    const otherParticipants = conversation.participants.filter(p => p.role !== "ADMIN");
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.displayName || `${participant.firstName} ${participant.lastName}`.trim() || "Unknown User";
    } else if (otherParticipants.length > 1) {
      return `Group Chat (${otherParticipants.length})`;
    }
    
    return "New Conversation";
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    const badges = {
      BOOKING: { label: "Booking", variant: "default" as const },
      GENERAL: { label: "General", variant: "secondary" as const },
      SUPPORT: { label: "Support", variant: "destructive" as const },
      ADMIN: { label: "Admin", variant: "outline" as const },
    };
    
    return badges[type as keyof typeof badges] || { label: type, variant: "secondary" as const };
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { label: "Active", variant: "default" as const },
      ARCHIVED: { label: "Archived", variant: "secondary" as const },
      CLOSED: { label: "Closed", variant: "outline" as const },
      SYSTEM_CLOSED: { label: "System Closed", variant: "outline" as const },
    };
    
    return badges[status as keyof typeof badges] || { label: status, variant: "secondary" as const };
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const badges = {
      HIGH: { label: "High", variant: "destructive" as const },
      NORMAL: { label: "Normal", variant: "secondary" as const },
      LOW: { label: "Low", variant: "outline" as const },
    };
    
    return badges[priority as keyof typeof badges] || { label: priority, variant: "secondary" as const };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Conversations
            {totalUnread > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalUnread} unread
              </Badge>
            )}
          </CardTitle>
          
          <Button onClick={loadConversations} disabled={loading}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="BOOKING">Booking</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="SUPPORT">Support</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="SYSTEM_CLOSED">System Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Conversation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                        <div>
                          <div className="h-4 bg-muted rounded w-40 mb-2 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 bg-muted rounded w-8 animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : conversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                conversations.map((conversation) => {
                  const typeBadge = getTypeBadge(conversation.type);
                  const statusBadge = getStatusBadge(conversation.status);
                  const priorityBadge = getPriorityBadge(conversation.priority);
                  const unreadCount = conversation.unreadCount || 0;
                  
                  return (
                    <TableRow 
                      key={conversation.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewConversation(conversation)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="relative">
                            {conversation.booking ? (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                            ) : (
                              <Avatar className="h-10 w-10">
                                <AvatarImage 
                                  src={conversation.participants.find(p => p.role !== "ADMIN")?.profileImage} 
                                />
                                <AvatarFallback>
                                  <Users className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            {unreadCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                              >
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </Badge>
                            )}
                          </div>

                          {/* Conversation details */}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {getConversationDisplayName(conversation)}
                            </p>
                            {conversation.booking && (
                              <p className="text-sm text-muted-foreground">
                                {format(conversation.booking.startDateTime, "MMM d, yyyy")} • {conversation.booking.bookingStatus}
                              </p>
                            )}
                            
                            {/* Status indicators */}
                            <div className="flex items-center gap-1 mt-1">
                              {conversation.isLocked && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                              {conversation.isArchived && (
                                <Archive className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={typeBadge.variant}>
                          {typeBadge.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant={priorityBadge.variant}>
                          {priorityBadge.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-medium">
                          {conversation.participants.length}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-medium">
                          {conversation.messageCount || 0}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(conversation.lastActivityAt, { addSuffix: true })}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewConversation(conversation);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Conversation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handlePriorityUpdate(conversation.id, 
                                conversation.priority === "HIGH" ? "NORMAL" : "HIGH"
                              );
                            }}>
                              <Flag className="h-4 w-4 mr-2" />
                              {conversation.priority === "HIGH" ? "Remove Priority" : "Mark High Priority"}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleLockToggle(conversation.id, conversation.isLocked);
                            }}>
                              {conversation.isLocked ? (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Unlock Conversation
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Lock Conversation
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(conversation.id, 
                                conversation.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE"
                              );
                            }}>
                              <Archive className="h-4 w-4 mr-2" />
                              {conversation.status === "ACTIVE" ? "Archive" : "Unarchive"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}