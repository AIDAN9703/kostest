"use client";

import { io, Socket } from "socket.io-client";
import { 
  SocketMessage, 
  TypingIndicator,
  NewMessageEvent,
  MessageReadEvent
} from "@/shared/types/messaging";

class MessagingSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private userId: string | null = null;
  private currentConversation: string | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize and connect to the messaging server
   */
  connect(userId: string) {
    if (this.socket?.connected || !userId) {
      return;
    }

    this.userId = userId;
    
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://your-messaging-server.com'  // Replace with your actual messaging server URL
      : 'ws://localhost:4000';

    console.log(`Connecting to messaging server: ${serverUrl}`);

    this.socket = io(serverUrl, {
      auth: {
        userId: userId
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect from the messaging server
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from messaging server');
      this.socket.disconnect();
      this.socket = null;
      this.currentConversation = null;
      this.clearTypingTimeout();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to messaging server');
      this.reconnectAttempts = 0;
      
      // Rejoin current conversation if we were in one
      if (this.currentConversation) {
        this.joinConversation(this.currentConversation);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from messaging server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Authentication events
    this.socket.on('connected', (data) => {
      console.log('Authentication successful:', data);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
    });

    // Conversation events
    this.socket.on('joined-conversation', (data) => {
      console.log('Joined conversation:', data.conversationId);
      this.currentConversation = data.conversationId;
    });

    // Message events
    this.socket.on('message-received', (data: NewMessageEvent) => {
      console.log('New message received:', data);
      this.handleNewMessage(data);
    });

    // Typing events
    this.socket.on('user-typing', (data: TypingIndicator & { timestamp: string }) => {
      console.log('User typing:', data);
      this.handleTypingIndicator(data);
    });

    // Read receipts
    this.socket.on('message-read-receipt', (data: MessageReadEvent) => {
      console.log('Message read receipt:', data);
      this.handleMessageRead(data);
    });

    // User presence events
    this.socket.on('user-online', (data) => {
      console.log('User came online:', data);
      this.handleUserPresence(data, true);
    });

    this.socket.on('user-offline', (data) => {
      console.log('User went offline:', data);
      this.handleUserPresence(data, false);
    });

    // Conversation updates
    this.socket.on('conversation-update', (data) => {
      console.log('Conversation updated:', data);
      this.handleConversationUpdate(data);
    });
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join conversation');
      return;
    }

    console.log(`Joining conversation: ${conversationId}`);
    this.socket.emit('join-conversation', { conversationId });
  }

  /**
   * Leave current conversation room
   */
  leaveConversation() {
    if (!this.socket?.connected || !this.currentConversation) {
      return;
    }

    console.log(`Leaving conversation: ${this.currentConversation}`);
    this.socket.emit('leave-conversation', { 
      conversationId: this.currentConversation 
    });
    
    this.currentConversation = null;
    this.clearTypingTimeout();
  }

  /**
   * Send a message via socket (for real-time updates)
   * Note: Actual message saving should still go through your server actions
   */
  sendMessage(conversationId: string, message: any) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send message');
      return;
    }

    this.socket.emit('new-message', {
      conversationId,
      message
    });
  }

  /**
   * Start typing indicator
   */
  startTyping(conversationId: string) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('typing-start', { conversationId });
    
    // Auto-stop typing after 5 seconds if no activity
    this.clearTypingTimeout();
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(conversationId);
    }, 5000);
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('typing-stop', { conversationId });
    this.clearTypingTimeout();
  }

  /**
   * Send message read receipt
   */
  markMessageAsRead(conversationId: string, messageId: string) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('message-read', {
      conversationId,
      messageId
    });
  }

  /**
   * Notify about conversation updates
   */
  notifyConversationUpdate(conversationId: string, updateType: string, updateData: any) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('conversation-updated', {
      conversationId,
      updateType,
      updateData
    });
  }

  /**
   * Clear typing timeout
   */
  private clearTypingTimeout() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  // Event handler methods (can be overridden or extended)
  private handleNewMessage(data: NewMessageEvent) {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('messaging:new-message', { detail: data }));
  }

  private handleTypingIndicator(data: TypingIndicator & { timestamp: string }) {
    window.dispatchEvent(new CustomEvent('messaging:typing-indicator', { detail: data }));
  }

  private handleMessageRead(data: MessageReadEvent) {
    window.dispatchEvent(new CustomEvent('messaging:message-read', { detail: data }));
  }

  private handleUserPresence(data: any, isOnline: boolean) {
    window.dispatchEvent(new CustomEvent('messaging:user-presence', { 
      detail: { ...data, isOnline } 
    }));
  }

  private handleConversationUpdate(data: any) {
    window.dispatchEvent(new CustomEvent('messaging:conversation-update', { detail: data }));
  }

  /**
   * Register custom event listeners
   */
  on(event: string, handler: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  /**
   * Remove event listeners
   */
  off(event: string, handler?: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off(event, handler);
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      connected: this.isConnected(),
      userId: this.userId,
      currentConversation: this.currentConversation,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create singleton instance
export const messagingSocket = new MessagingSocketService();

// React hook for using the messaging socket
export function useMessagingSocket() {
  return {
    socket: messagingSocket,
    connect: (userId: string) => messagingSocket.connect(userId),
    disconnect: () => messagingSocket.disconnect(),
    isConnected: () => messagingSocket.isConnected(),
    joinConversation: (id: string) => messagingSocket.joinConversation(id),
    leaveConversation: () => messagingSocket.leaveConversation(),
    sendMessage: (conversationId: string, message: any) => 
      messagingSocket.sendMessage(conversationId, message),
    startTyping: (conversationId: string) => messagingSocket.startTyping(conversationId),
    stopTyping: (conversationId: string) => messagingSocket.stopTyping(conversationId),
    markAsRead: (conversationId: string, messageId: string) => 
      messagingSocket.markMessageAsRead(conversationId, messageId),
    getStatus: () => messagingSocket.getStatus(),
  };
}

// Event listener hook for React components
export function useMessagingEvents() {
  const addEventListener = (eventType: string, handler: (event: CustomEvent) => void) => {
    window.addEventListener(`messaging:${eventType}`, handler as EventListener);
    return () => window.removeEventListener(`messaging:${eventType}`, handler as EventListener);
  };

  return {
    onNewMessage: (handler: (event: CustomEvent<NewMessageEvent>) => void) => 
      addEventListener('new-message', handler),
    onTypingIndicator: (handler: (event: CustomEvent<TypingIndicator>) => void) => 
      addEventListener('typing-indicator', handler),
    onMessageRead: (handler: (event: CustomEvent<MessageReadEvent>) => void) => 
      addEventListener('message-read', handler),
    onUserPresence: (handler: (event: CustomEvent<any>) => void) => 
      addEventListener('user-presence', handler),
    onConversationUpdate: (handler: (event: CustomEvent<any>) => void) => 
      addEventListener('conversation-update', handler),
  };
}