import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getConversations, getConversation } from "@/features/messaging/actions";
import { AdminMessagingLayout } from "@/features-admin/messaging/components";

interface AdminConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: AdminConversationPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { title: "Admin Messages" };
  }

  try {
    const result = await getConversation(id);
    
    if (result.success) {
      const conversation = result.data;
      
      let title = "Conversation";
      
      if (conversation.subject) {
        title = conversation.subject;
      } else if (conversation.booking) {
        title = `${conversation.booking.boatName} - ${conversation.booking.customerName}`;
      }
      
      return {
        title: `${title} | Admin Messages`,
        description: "Admin view of conversation",
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return { title: "Conversation | Admin Messages" };
}

export default async function AdminConversationPage({ params }: AdminConversationPageProps) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Load conversation details
  let selectedConversation;
  try {
    const result = await getConversation(id);
    if (result.success) {
      selectedConversation = result.data;
    } else {
      notFound();
    }
  } catch (error) {
    console.error("Error loading conversation:", error);
    notFound();
  }

  // Load conversations list for context
  let initialConversations;
  try {
    const result = await getConversations({}, { page: 1, limit: 100 });
    if ('conversations' in result) {
      initialConversations = result;
    }
  } catch (error) {
    console.error("Error loading conversations:", error);
  }

  return (
    <AdminMessagingLayout
      currentUserId={session.user.id!}
      initialConversations={initialConversations}
      selectedConversationId={id}
      selectedConversation={selectedConversation}
    />
  );
}