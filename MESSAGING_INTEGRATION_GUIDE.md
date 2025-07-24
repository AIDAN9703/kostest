# Messaging System Integration Guide

This guide shows how to integrate the messaging system with your existing booking flow and how admins can manage conversations.

## 🏗️ Complete System Architecture

### Database Layer
- **conversations** - Main conversation records with booking relationships
- **messages** - Individual messages with read tracking and threading support  
- **conversation_participants** - Many-to-many with personalized settings
- **notifications** - SMS/email/in-app notifications

### Server Layer
- Comprehensive server actions in `features/messaging/actions/`
- Booking integration service for automatic conversation creation
- Real-time Socket.IO integration with presence tracking

## 🔄 Integration Examples

### 1. Booking Flow Integration

After a user creates a booking, automatically redirect them to their conversation:

```tsx
// In your booking form component
const handleBookingSubmit = async (data: BookingRequest) => {
  const result = await createBookingRequest({
    ...data,
    boatId: boat.id
  });

  if (result.success) {
    // Redirect to the auto-created conversation
    if (result.conversationId) {
      router.push(`/messages/${result.conversationId}`);
    } else {
      router.push('/messages'); // Fallback to messages list
    }
  }
};
```

### 2. Admin Booking Status Updates

When admins update booking statuses, it automatically creates system messages:

```tsx
// In admin booking management
const updateBookingStatus = async (bookingId: string, newStatus: string) => {
  // Update booking status (your existing logic)
  await updateBookingInDatabase(bookingId, newStatus);
  
  // This will automatically send system message and notifications
  await updateBookingConversationStatus(
    bookingId,
    previousStatus,
    newStatus,
    session.user.id // admin who made the change
  );
};
```

### 3. Real-time Message Updates

In your components, connect to the messaging socket:

```tsx
import { useMessagingSocket, useMessagingEvents } from "@/features/messaging/services/socket";

function ConversationComponent() {
  const { connect, joinConversation } = useMessagingSocket();
  const messagingEvents = useMessagingEvents();

  useEffect(() => {
    // Connect user to messaging
    connect(session.user.id);
    joinConversation(conversationId);

    // Listen for new messages
    const unsubscribe = messagingEvents.onNewMessage((event) => {
      const { message, conversationId } = event.detail;
      // Update UI with new message
      setMessages(prev => [...prev, message]);
    });

    return unsubscribe;
  }, [conversationId]);
}
```

## 📱 User Experience Flow

### For Customers:
1. **Book a Boat** → Booking created → Conversation auto-created → Redirected to `/messages/{conversationId}`
2. **Real-time Chat** → Communicate directly with boat owner
3. **Get Updates** → Receive SMS/email notifications for booking updates
4. **View History** → Access all conversations in `/messages`

### For Admins:
1. **Monitor All Conversations** → `/admin/messages` shows all platform conversations
2. **Jump into Any Conversation** → Click any conversation to join and help
3. **Manage Priorities** → Mark conversations as high priority
4. **Send System Messages** → Automated messages for booking/payment updates

## 🔧 Configuration

### Environment Variables
Add to your `.env.local`:

```bash
# Messaging Server (your existing Socket.IO server)
NEXT_PUBLIC_MESSAGING_SERVER_URL=ws://localhost:4000

# Twilio (you already have these)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
```

### Socket.IO Server
Your existing messaging server at `messaging-server/index.js` has been enhanced with:
- Room-based messaging (conversation IDs as rooms)
- Typing indicators and presence tracking
- Authentication validation
- Health check endpoints

Start it with: `cd messaging-server && node index.js`

## 🚀 Navigation Integration

Add messaging to your navigation:

```tsx
// In your navigation component
import { Badge } from "@/shared/components/ui/badge";
import { MessageSquare } from "lucide-react";

function Navigation() {
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread count
  useEffect(() => {
    loadUnreadCount().then(setUnreadCount);
  }, []);

  return (
    <nav>
      <Link href="/messages" className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Messages
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1">
            {unreadCount}
          </Badge>
        )}
      </Link>
    </nav>
  );
}
```

## 📊 Admin Features

### Message Management Dashboard
- View all conversations across the platform
- Filter by type, status, priority
- Search conversations and participants
- Quick actions (archive, lock, prioritize)

### Analytics
- Conversation type distribution
- Response time metrics
- Unread message tracking
- Recent activity monitoring

## 🔐 Security & Permissions

### User Permissions
- Users can only access conversations they participate in
- Boat owners can communicate with their renters
- System prevents unauthorized access

### Admin Permissions
- Admins can view and join any conversation
- Can lock conversations to prevent further messages
- Can assign conversations to specific admins
- Can send system messages

## 📧 Notification System

### SMS Notifications (via Twilio)
- New message notifications
- Booking status updates
- Configurable per user

### Email Notifications
- Detailed message notifications
- Booking confirmations and updates
- Marketing preferences respected

### In-App Notifications
- Real-time browser notifications
- Unread message badges
- Activity indicators

## 🧪 Testing the Integration

1. **Create a Booking** → Should auto-create conversation
2. **Send Messages** → Should appear in real-time
3. **Admin Actions** → Should generate system messages
4. **Notifications** → Should send SMS/email (in production)

## 🔄 Migration Steps

1. **Run Database Migration** → `npx drizzle-kit generate && npx drizzle-kit migrate`
2. **Start Messaging Server** → `cd messaging-server && node index.js`
3. **Update Booking Flow** → Add conversation redirection
4. **Test End-to-End** → Book → Message → Admin Actions

## 🎯 Next Steps

The messaging system is production-ready! Key features implemented:

✅ **Complete Database Schema** - Professional-grade with proper relationships  
✅ **Real-time Messaging** - Socket.IO with room management and presence  
✅ **Admin Interface** - Complete message management dashboard  
✅ **Booking Integration** - Auto-conversation creation and status updates  
✅ **Notifications** - SMS, email, and in-app notifications  
✅ **Security** - Proper authentication and authorization  
✅ **UI Components** - Following your existing design patterns  

The system scales from your current admin-owned boats to future real boat owners seamlessly!