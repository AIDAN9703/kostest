const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] // Replace with your actual domain
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store active users and their conversation rooms
const activeUsers = new Map(); // userId -> { socketId, conversationRooms: Set<conversationId> }
const typingUsers = new Map(); // conversationId -> Set<userId>

/**
 * Validates if a user can join a conversation room
 * In production, this should validate against your database
 */
async function canUserAccessConversation(userId, conversationId) {
  // TODO: Implement database check
  // For now, allow all authenticated users
  return userId && conversationId;
}

/**
 * Authenticates socket connection using session data
 * You'll need to integrate with your NextAuth.js session validation
 */
async function authenticateSocket(socket) {
  // TODO: Implement proper authentication
  // For now, expect userId to be passed in handshake
  const userId = socket.handshake.auth?.userId;
  return userId ? { id: userId } : null;
}

io.on('connection', async (socket) => {
  console.log('New socket connection:', socket.id);
  
  // Authenticate the user
  const user = await authenticateSocket(socket);
  if (!user) {
    console.log('Unauthenticated connection rejected:', socket.id);
    socket.emit('error', { message: 'Authentication required' });
    socket.disconnect();
    return;
  }

  console.log(`User ${user.id} connected with socket ${socket.id}`);

  // Store active user info
  activeUsers.set(user.id, {
    socketId: socket.id,
    conversationRooms: new Set()
  });

  // Join conversation rooms
  socket.on('join-conversation', async (data) => {
    const { conversationId } = data;
    
    if (!conversationId) {
      socket.emit('error', { message: 'Conversation ID required' });
      return;
    }

    // Validate access
    const canAccess = await canUserAccessConversation(user.id, conversationId);
    if (!canAccess) {
      socket.emit('error', { message: 'Access denied to conversation' });
      return;
    }

    // Join the conversation room
    socket.join(`conversation:${conversationId}`);
    
    // Track user's conversation rooms
    const userInfo = activeUsers.get(user.id);
    if (userInfo) {
      userInfo.conversationRooms.add(conversationId);
    }

    console.log(`User ${user.id} joined conversation ${conversationId}`);
    
    // Notify others in the conversation that user came online
    socket.to(`conversation:${conversationId}`).emit('user-online', {
      userId: user.id,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    });

    // Send acknowledgment
    socket.emit('joined-conversation', { conversationId });
  });

  // Leave conversation room
  socket.on('leave-conversation', (data) => {
    const { conversationId } = data;
    
    if (!conversationId) {
      return;
    }

    socket.leave(`conversation:${conversationId}`);
    
    // Remove from user's conversation rooms
    const userInfo = activeUsers.get(user.id);
    if (userInfo) {
      userInfo.conversationRooms.delete(conversationId);
    }

    // Notify others that user went offline for this conversation
    socket.to(`conversation:${conversationId}`).emit('user-offline', {
      userId: user.id,
      conversationId: conversationId,
      timestamp: new Date().toISOString()
    });

    console.log(`User ${user.id} left conversation ${conversationId}`);
  });

  // Handle new messages
  socket.on('new-message', (data) => {
    const { conversationId, message } = data;
    
    if (!conversationId || !message) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }

    // Validate user is in this conversation room
    const userInfo = activeUsers.get(user.id);
    if (!userInfo || !userInfo.conversationRooms.has(conversationId)) {
      socket.emit('error', { message: 'Not in conversation room' });
      return;
    }

    // Broadcast message to all users in the conversation (excluding sender)
    socket.to(`conversation:${conversationId}`).emit('message-received', {
      conversationId: conversationId,
      message: {
        ...message,
        senderId: user.id, // Ensure sender ID is set server-side
        timestamp: new Date().toISOString()
      }
    });

    console.log(`Message sent to conversation ${conversationId} by user ${user.id}`);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { conversationId } = data;
    
    if (!conversationId) {
      return;
    }

    // Validate user is in conversation
    const userInfo = activeUsers.get(user.id);
    if (!userInfo || !userInfo.conversationRooms.has(conversationId)) {
      return;
    }

    // Track typing user
    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Set());
    }
    typingUsers.get(conversationId).add(user.id);

    // Broadcast to others in conversation
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      userId: user.id,
      conversationId: conversationId,
      isTyping: true,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('typing-stop', (data) => {
    const { conversationId } = data;
    
    if (!conversationId) {
      return;
    }

    // Remove from typing users
    if (typingUsers.has(conversationId)) {
      typingUsers.get(conversationId).delete(user.id);
      
      // Clean up empty sets
      if (typingUsers.get(conversationId).size === 0) {
        typingUsers.delete(conversationId);
      }
    }

    // Broadcast to others in conversation
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      userId: user.id,
      conversationId: conversationId,
      isTyping: false,
      timestamp: new Date().toISOString()
    });
  });

  // Handle message read receipts
  socket.on('message-read', (data) => {
    const { conversationId, messageId } = data;
    
    if (!conversationId || !messageId) {
      return;
    }

    // Validate user is in conversation
    const userInfo = activeUsers.get(user.id);
    if (!userInfo || !userInfo.conversationRooms.has(conversationId)) {
      return;
    }

    // Broadcast read receipt to others
    socket.to(`conversation:${conversationId}`).emit('message-read-receipt', {
      userId: user.id,
      conversationId: conversationId,
      messageId: messageId,
      readAt: new Date().toISOString()
    });
  });

  // Handle conversation updates (status changes, etc.)
  socket.on('conversation-updated', (data) => {
    const { conversationId, updateType, updateData } = data;
    
    if (!conversationId || !updateType) {
      return;
    }

    // Broadcast update to all users in conversation
    socket.to(`conversation:${conversationId}`).emit('conversation-update', {
      conversationId: conversationId,
      updateType: updateType,
      updateData: updateData,
      updatedBy: user.id,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User ${user.id} disconnected: ${reason}`);
    
    // Clean up user data
    const userInfo = activeUsers.get(user.id);
    if (userInfo) {
      // Notify all conversations the user was in
      userInfo.conversationRooms.forEach(conversationId => {
        socket.to(`conversation:${conversationId}`).emit('user-offline', {
          userId: user.id,
          conversationId: conversationId,
          timestamp: new Date().toISOString()
        });

        // Remove from typing indicators
        if (typingUsers.has(conversationId)) {
          typingUsers.get(conversationId).delete(user.id);
          if (typingUsers.get(conversationId).size === 0) {
            typingUsers.delete(conversationId);
          }
        }
      });
      
      // Remove user from active users
      activeUsers.delete(user.id);
    }
  });

  // Send welcome message
  socket.emit('connected', { 
    message: 'Connected to messaging server',
    userId: user.id,
    socketId: socket.id
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeConnections: activeUsers.size,
    activeConversations: typingUsers.size,
    timestamp: new Date().toISOString()
  });
});

// Get active users in a conversation (for debugging)
app.get('/debug/conversation/:id/users', (req, res) => {
  const conversationId = req.params.id;
  const room = io.sockets.adapter.rooms.get(`conversation:${conversationId}`);
  const userIds = [];
  
  if (room) {
    for (const [userId, userInfo] of activeUsers.entries()) {
      if (userInfo.conversationRooms.has(conversationId)) {
        userIds.push(userId);
      }
    }
  }
  
  res.json({ conversationId, activeUsers: userIds, roomSize: room?.size || 0 });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Messaging server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
}); 