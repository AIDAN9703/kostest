"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Image as ImageIcon, Plus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils/general-utils";

/* 
TODO: Integration Notes for Message Composer

1. REAL MESSAGE SENDING:
   Replace mockSendMessage with actual API call:
   ```tsx
   const sendMessage = async (content: string, type: 'text' | 'image' | 'file') => {
     await messagingAPI.sendMessage(conversationId, { content, type });
   };
   ```

2. FILE UPLOADS:
   Implement actual file upload handling:
   ```tsx
   const handleFileUpload = async (files: FileList) => {
     const uploadedFiles = await fileUploadService.upload(files);
     await sendMessage(uploadedFiles[0].url, 'file');
   };
   ```

3. REAL-TIME TYPING:
   Add typing indicator broadcast:
   ```tsx
   const handleTyping = useDebouncedCallback(() => {
     websocket.emit('typing', { conversationId, isTyping: true });
   }, 300);
   ```

4. EMOJI PICKER:
   Integrate with a real emoji picker library like emoji-mart

5. RICH TEXT:
   Consider adding rich text formatting (bold, italic, links)
*/

interface MessageComposerProps {
  onSendMessage?: (content: string, type?: 'text' | 'image' | 'file') => void;
  onMessageSent?: () => void;
  disabled?: boolean;
  placeholder?: string;
  conversation?: any; // Legacy prop - not used in new implementation
  className?: string;
}

export function MessageComposer({ 
  onSendMessage,
  onMessageSent,
  disabled = false,
  placeholder = "Type your message...",
  conversation, // Legacy prop - ignored
  className
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Mock send function for demonstration
  const mockSendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    console.log('Sending message:', { content, type, attachments });
    // TODO: Replace with real API call
  };

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      if (onSendMessage) {
        onSendMessage(message.trim(), attachments.length > 0 ? 'file' : 'text');
      } else {
        mockSendMessage(message.trim(), attachments.length > 0 ? 'file' : 'text');
      }
      
      onMessageSent?.(); // Call legacy callback if provided
      setMessage("");
      setAttachments([]);
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setIsExpanded(true);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const commonEmojis = ['😊', '😄', '😅', '😂', '🤣', '😍', '🥰', '😘', '😉', '😎', '🤔', '👍', '👌', '🙌', '👏', '🎉', '🔥', '💯', '❤️', '💙'];

  return (
    <div className={cn("border-t border-gray-200 bg-white", className)}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border text-sm min-w-0">
                <span className="truncate max-w-32">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-10 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                className="w-8 h-8 text-lg hover:bg-gray-200 rounded transition-colors flex items-center justify-center"
                onClick={() => {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                  textareaRef.current?.focus();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Composer */}
      <div className="p-4">
        <div className={`
          flex items-end gap-3 p-3 bg-gray-50 rounded-2xl border transition-all duration-200
          ${isExpanded || message ? 'bg-white border-gray-300 shadow-xs' : 'border-gray-200'}
        `}>
          {/* Attachment Button */}
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setIsExpanded(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[20px] max-h-32 resize-none border-0 bg-transparent p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0 scrollbar-thin scrollbar-thumb-gray-300"
              style={{ height: 'auto' }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>

            {/* Send Button */}
            <Button
              size="sm"
              className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full"
              onClick={handleSend}
              disabled={disabled || (!message.trim() && attachments.length === 0)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        {isExpanded && (
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex-1"></div>
            <Button variant="ghost" size="sm" className="text-xs h-6">
              <ImageIcon className="h-3 w-3 mr-1" />
              Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}