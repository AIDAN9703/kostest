"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Plus, Image as ImageIcon, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { MessageComposer } from "./MessageComposer";
import { TypingIndicator } from "./TypingIndicator";

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

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: "text" | "image" | "file" | "system";
  isRead: boolean;
  reactions?: { emoji: string; count: number; userIds: string[] }[];
}

interface ChatAreaProps {
  conversation: Conversation | undefined;
  onBackToConversations: () => void;
}

// Mock messages for demonstration
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    content: "Hi! I'm excited about the charter tomorrow. What time should I arrive at the marina?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    senderId: "user-1",
    senderName: "You",
    senderAvatar: "/images/avatars/user.jpg",
    type: "text",
    isRead: true
  },
  {
    id: "2",
    content: "Hello! Great to hear from you. Please arrive at 8:30 AM at Dock 12. I'll be there to greet you and give you a quick safety briefing before we set sail.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
    senderId: "captain-1",
    senderName: "Captain Mike Johnson",
    senderAvatar: "/images/team/captain-mike.jpg",
    type: "text",
    isRead: true
  },
  {
    id: "3",
    content: "Perfect! Should I bring anything specific? Also, what's the weather looking like?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
    senderId: "user-1",
    senderName: "You",
    senderAvatar: "/images/avatars/user.jpg",
    type: "text",
    isRead: true
  },
  {
    id: "4",
    content: "Just bring sunscreen, a hat, and comfortable clothes. We provide life jackets and all safety equipment. Weather is looking fantastic - sunny with light winds, perfect for sailing! 🌞⛵",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21), // 21 hours ago
    senderId: "captain-1",
    senderName: "Captain Mike Johnson",
    senderAvatar: "/images/team/captain-mike.jpg",
    type: "text",
    isRead: true,
    reactions: [
      { emoji: "👍", count: 1, userIds: ["user-1"] }
    ]
  },
  {
    id: "5",
    content: "Booking confirmed for Sea Breeze II - 4 hour charter tomorrow at 9:00 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
    senderId: "system",
    senderName: "System",
    senderAvatar: "",
    type: "system",
    isRead: true
  },
  {
    id: "6",
    content: "Awesome! Thanks for all the details. Looking forward to it! 🎉",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19), // 19 hours ago
    senderId: "user-1",
    senderName: "You",
    senderAvatar: "/images/avatars/user.jpg",
    type: "text",
    isRead: true
  },
  {
    id: "7",
    content: "Perfect! I'll have the boat ready at 9 AM sharp. Looking forward to your charter!",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    senderId: "captain-1",
    senderName: "Captain Mike Johnson",
    senderAvatar: "/images/team/captain-mike.jpg",
    type: "text",
    isRead: false
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

function MessageBubble({ message, isOwn, showAvatar }: { 
  message: ChatMessage; 
  isOwn: boolean; 
  showAvatar: boolean;
}) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-full max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
          <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-white text-xs">
            {message.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (only show for others' messages and when showing avatar) */}
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-500 mb-1 px-3">{message.senderName}</span>
        )}

        {/* Message Bubble */}
        <div
          className={`
            px-4 py-2 rounded-2xl break-words
            ${isOwn 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
            }
          `}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs hover:bg-gray-200 transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-600">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Read Status */}
        <div className={`flex items-center gap-2 mt-1 px-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400">
            {formatMessageTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className={`text-xs ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`}>
              {message.isRead ? 'Read' : 'Sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatArea({ conversation, onBackToConversations }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockMessages]);

  // Simulate typing indicator
  useEffect(() => {
    if (conversation) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [conversation]);

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Messages</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Select a conversation from the sidebar to start chatting with boat owners, captains, and our support team.
          </p>
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time messaging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Booking coordination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Booking Context Bar */}
      {conversation.boatName && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                ⛵ Charter: {conversation.boatName}
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {conversation.bookingId}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-900">
              View Details
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {mockMessages.map((message, index) => {
          const isOwn = message.senderId === "user-1";
          const prevMessage = mockMessages[index - 1];
          const showAvatar = !prevMessage || 
                           prevMessage.senderId !== message.senderId ||
                           message.timestamp.getTime() - prevMessage.timestamp.getTime() > 5 * 60 * 1000; // 5 minutes

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <TypingIndicator 
            participantName={conversation.participant.name}
            participantAvatar={conversation.participant.avatar}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <MessageComposer />
    </div>
  );
}
