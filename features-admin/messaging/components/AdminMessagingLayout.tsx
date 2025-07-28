"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { 
  MessageSquare, 
  BarChart3, 
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { 
  ConversationWithDetails, 
  ConversationListResponse 
} from "@/shared/types/messaging.types";
import { ConversationView } from "@/features/messaging/components";
import { useMessagingSocket } from "@/features/messaging/services/socket";
import { AdminConversationTable } from "./AdminConversationTable";

interface AdminMessagingLayoutProps {
  currentUserId: string;
  initialConversations?: ConversationListResponse;
  selectedConversationId?: string;
  selectedConversation?: ConversationWithDetails;
  className?: string;
}

export function AdminMessagingLayout({
  currentUserId,
  initialConversations,
  selectedConversationId,
  selectedConversation,
  className
}: AdminMessagingLayoutProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("conversations");
  const { connect, isConnected } = useMessagingSocket();

  // Connect to messaging socket
  useEffect(() => {
    if (currentUserId && !isConnected()) {
      connect(currentUserId);
    }
  }, [currentUserId, connect, isConnected]);

  // Handle back to conversations list
  const handleBackToList = () => {
    router.push('/admin/messages');
  };

  // Calculate statistics
  const stats = {
    total: initialConversations?.conversations.length || 0,
    unread: initialConversations?.totalUnread || 0,
    highPriority: initialConversations?.conversations.filter(c => c.priority === "HIGH").length || 0,
    archived: initialConversations?.conversations.filter(c => c.status === "ARCHIVED").length || 0,
  };

  // If viewing specific conversation, show conversation view
  if (selectedConversationId && selectedConversation) {
    return (
      <div className={cn("h-screen", className)}>
        <ConversationView
          conversationId={selectedConversationId}
          currentUserId={currentUserId}
          initialConversation={selectedConversation}
          onBack={handleBackToList}
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div className={cn("p-6 space-y-6", className)}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Message Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all conversations across the platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All active conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Messages
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Priority
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">
              Urgent conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Archived
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
            <p className="text-xs text-muted-foreground">
              Closed conversations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversations
            {stats.unread > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {stats.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <AdminConversationTable 
            initialData={initialConversations}
            className="border-0 shadow-none"
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Conversation Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Conversation Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initialConversations?.conversations && (
                    <>
                      {/* Calculate type distribution */}
                      {(() => {
                        const typeStats = initialConversations.conversations.reduce((acc, conv) => {
                          acc[conv.type] = (acc[conv.type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                        return Object.entries(typeStats).map(([type, count]) => {
                          const percentage = (count / initialConversations.conversations.length) * 100;
                          
                          return (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {type.toLowerCase().replace('_', ' ')}
                                </Badge>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-12">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initialConversations?.conversations
                    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
                    .slice(0, 5)
                    .map(conversation => (
                      <div key={conversation.id} className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conversation.subject || `Conversation ${conversation.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conversation.lastActivityAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {conversation.type}
                        </Badge>
                      </div>
                    )) || []
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}