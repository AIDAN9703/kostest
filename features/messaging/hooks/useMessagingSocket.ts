"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { messagingSocket } from "@/features/messaging/services/socket";
import { 
  SocketMessage, 
  TypingIndicator,
  NewMessageEvent,
  MessageReadEvent
} from "@/shared/types/messaging";

interface UseMessagingSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (userId: string) => void;
  disconnect: () => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: () => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onNewMessage: (callback: (data: NewMessageEvent) => void) => () => void;
  onTyping: (callback: (data: TypingIndicator) => void) => () => void;
  onMessageRead: (callback: (data: MessageReadEvent) => void) => () => void;
  onUserPresence: (callback: (data: { userId: string; isOnline: boolean }) => void) => () => void;
}

export function useMessagingSocket(): UseMessagingSocketReturn {
  const [isConnected, setIsConnected] = useState(() => messagingSocket.isConnected());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store current connection state ref to avoid stale closures
  const connectionStateRef = useRef({ isConnected, isConnecting });
  connectionStateRef.current = { isConnected, isConnecting };

  // Connect to socket
  const connect = useCallback((userId: string) => {
    if (messagingSocket.isConnected() || connectionStateRef.current.isConnecting) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      messagingSocket.connect(userId);
      // Connection state will be updated by socket events, not polling
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, []); // No dependencies to avoid recreation

  // Disconnect from socket
  const disconnect = useCallback(() => {
    try {
      messagingSocket.disconnect();
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, []);

  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (!messagingSocket.isConnected()) {
      setError('Not connected to messaging server');
      return;
    }

    try {
      messagingSocket.joinConversation(conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join conversation');
    }
  }, []);

  // Leave conversation
  const leaveConversation = useCallback(() => {
    try {
      messagingSocket.leaveConversation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave conversation');
    }
  }, []);

  // Start typing indicator
  const startTyping = useCallback((conversationId: string) => {
    if (!messagingSocket.isConnected()) {
      return;
    }

    try {
      messagingSocket.startTyping(conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start typing indicator');
    }
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId: string) => {
    try {
      messagingSocket.stopTyping(conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop typing indicator');
    }
  }, []);

  // Event handlers that don't depend on unstable references
  const onNewMessage = useCallback((callback: (data: NewMessageEvent) => void) => {
    const handler = (event: CustomEvent) => {
      try {
        callback(event.detail);
      } catch (err) {
        console.error('Error in new message callback:', err);
      }
    };
    
    window.addEventListener('messaging:new-message', handler as EventListener);
    return () => window.removeEventListener('messaging:new-message', handler as EventListener);
  }, []);

  const onTyping = useCallback((callback: (data: TypingIndicator) => void) => {
    const handler = (event: CustomEvent) => {
      try {
        callback(event.detail);
      } catch (err) {
        console.error('Error in typing callback:', err);
      }
    };
    
    window.addEventListener('messaging:typing-indicator', handler as EventListener);
    return () => window.removeEventListener('messaging:typing-indicator', handler as EventListener);
  }, []);

  const onMessageRead = useCallback((callback: (data: MessageReadEvent) => void) => {
    const handler = (event: CustomEvent) => {
      try {
        callback(event.detail);
      } catch (err) {
        console.error('Error in message read callback:', err);
      }
    };
    
    window.addEventListener('messaging:message-read', handler as EventListener);
    return () => window.removeEventListener('messaging:message-read', handler as EventListener);
  }, []);

  const onUserPresence = useCallback((callback: (data: { userId: string; isOnline: boolean }) => void) => {
    const handler = (event: CustomEvent) => {
      try {
        callback(event.detail);
      } catch (err) {
        console.error('Error in user presence callback:', err);
      }
    };
    
    window.addEventListener('messaging:user-presence', handler as EventListener);
    return () => window.removeEventListener('messaging:user-presence', handler as EventListener);
  }, []);

  // Monitor connection status - MUCH less aggressive than before
  useEffect(() => {
    // Only check on mount and when explicitly needed
    const updateConnectionState = () => {
      const connected = messagingSocket.isConnected();
      setIsConnected(connected);
      
      if (connected && connectionStateRef.current.isConnecting) {
        setIsConnecting(false);
        setError(null);
      }
    };

    // Check once on mount
    updateConnectionState();

    // Set up much less frequent checks - only every 30 seconds instead of every second
    const interval = setInterval(updateConnectionState, 30000);

    return () => clearInterval(interval);
  }, []); // No dependencies to prevent recreation

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    onNewMessage,
    onTyping,
    onMessageRead,
    onUserPresence
  };
} 