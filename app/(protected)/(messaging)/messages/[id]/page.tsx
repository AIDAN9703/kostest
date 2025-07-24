import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getConversation } from "@/features/messaging/actions";
import { ConversationView } from "@/features/messaging/components/ConversationView";

interface ConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ConversationPageProps): Promise<Metadata> {
  const session = await auth();
  
  if (!session?.user) {
    return { title: "Messages | KOS" };
  }

  const { id } = await params;

  try {
    const result = await getConversation(id);
    
    if (result.success) {
      const conversation = result.data;
      
      // Generate title based on conversation
      let title = "Messages";
      
      if (conversation.subject) {
        title = conversation.subject;
      } else if (conversation.booking) {
        title = `${conversation.booking.boatName} - ${conversation.booking.customerName}`;
      } else {
        // Get other participants
        const otherParticipants = conversation.participants.filter(p => p.userId !== session.user.id);
        if (otherParticipants.length === 1) {
          const participant = otherParticipants[0];
          title = participant.displayName || `${participant.firstName} ${participant.lastName}`.trim() || "Conversation";
        } else if (otherParticipants.length > 1) {
          title = `Group Chat (${otherParticipants.length + 1})`;
        }
      }
      
      return {
        title: `${title} | KOS Messages`,
        description: "Conversation about your boat booking",
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return { title: "Conversation | KOS Messages" };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Load conversation details
  let selectedConversation;
  try {
    const result = await getConversation(id);
    if (result.success) {
      selectedConversation = result.data;
    } else {
      // Conversation not found or access denied
      notFound();
    }
  } catch (error) {
    console.error("Error loading conversation:", error);
    notFound();
  }

  return (
    <ConversationView
      conversationId={id}
      currentUserId={session.user.id!}
      initialConversation={selectedConversation}
      className="h-full"
    />
  );
}