"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface TypingIndicatorProps {
  participantName: string;
  participantAvatar: string;
}

export function TypingIndicator({ participantName, participantAvatar }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 mb-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={participantAvatar} alt={participantName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
            {participantName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Typing Animation */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1 px-3">{participantName} is typing...</span>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
          <div className="flex gap-1 items-center">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
