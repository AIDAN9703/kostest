"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Send, 
  Paperclip, 
  Smile, 
  X,
  Image as ImageIcon,
  FileText,
  Loader2
} from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { 
  ConversationWithDetails,
  MessageWithDetails,
  SendMessageRequest 
} from "@/shared/types/messaging";
import { sendMessage } from "@/features/messaging/actions";
import { useMessagingSocket } from "@/features/messaging/services/socket";

interface MessageComposerProps {
  conversation: ConversationWithDetails;
  onMessageSent?: () => void;
  className?: string;
}

export function MessageComposer({ 
  conversation, 
  onMessageSent,
  className 
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { startTyping, stopTyping, sendMessage: socketSendMessage } = useMessagingSocket();

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping(conversation.id);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversation.id);
    }, 3000);
  };

  const handleTypingStop = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversation.id);
    }
  };

  // Handle message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
    
    if (e.target.value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // File type validation
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      // Size validation (10MB max per file)
      const maxSize = 10 * 1024 * 1024;
      
      return allowedTypes.includes(file.type) && file.size <= maxSize;
    });
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = async () => {
    const messageText = message.trim();
    
    if (!messageText && attachments.length === 0) {
      return;
    }

    if (conversation.isLocked) {
      // Show error message
      return;
    }

    setSending(true);
    handleTypingStop();
    
    try {
      const messageData: SendMessageRequest = {
        conversationId: conversation.id,
        content: messageText,
        messageType: "TEXT",
      };

      // Send via server action
      const result = await sendMessage(messageData);
      
      if (result.success) {
        // Send real-time update
        socketSendMessage(conversation.id, {
          content: messageText,
          messageType: "TEXT",
        });
        
        // Clear form
        setMessage("");
        setAttachments([]);
        adjustTextareaHeight();
        onMessageSent?.();
        
        // Focus back to textarea
        textareaRef.current?.focus();
      } else {
        console.error("Failed to send message:", result.error);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: Show error toast
    } finally {
      setSending(false);
    }
  };

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        stopTyping(conversation.id);
      }
    };
  }, [conversation.id, isTyping, stopTyping]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const canSend = (message.trim() || attachments.length > 0) && !sending && !conversation.isLocked;

  return (
    <Card className={cn("border-t-0 rounded-t-none", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="flex items-center gap-2 px-3 py-2"
              >
                {getFileIcon(file.type)}
                <span className="text-xs">
                  {file.name} ({formatFileSize(file.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Message input */}
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <div className="flex gap-1 pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || conversation.isLocked}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyPress}
              placeholder={
                conversation.isLocked 
                  ? "This conversation is locked"
                  : "Type a message..."
              }
              className="min-h-[40px] max-h-[120px] resize-none pr-12"
              disabled={sending || conversation.isLocked}
              rows={1}
            />
            
            {/* Emoji button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 h-6 w-6"
              disabled={sending || conversation.isLocked}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={!canSend}
            size="icon"
            className="h-9 w-9 rounded-full"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Status messages */}
        {conversation.isLocked && (
          <p className="text-xs text-muted-foreground text-center">
            🔒 This conversation has been locked by an administrator
          </p>
        )}
        
        {attachments.length >= 5 && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum 5 files allowed
          </p>
        )}
      </CardContent>
    </Card>
  );
}