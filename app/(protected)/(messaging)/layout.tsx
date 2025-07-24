import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getConversations } from "@/features/messaging/actions";
import { MessagingClient } from "@/features/messaging/components/MessagingClient";
import { MessagingErrorBoundary } from "@/features/messaging/components/MessagingErrorBoundary";

export const metadata: Metadata = {
  title: "Messages | KOS",
  description: "Communicate with boat owners, captains, and support team",
};

interface MessagingLayoutProps {
  children: React.ReactNode;
}

export default async function MessagingLayout({ children }: MessagingLayoutProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch conversations data on the server
  let initialConversations;
  try {
    const result = await getConversations(
      {}, // No filters - get all conversations
      { page: 1, limit: 50 } // Get first 50 conversations
    );
    
    if ('conversations' in result) {
      initialConversations = result;
    }
  } catch (error) {
    console.error("Error loading conversations in layout:", error);
    // Don't fail the page load - let the client handle the error state
  }

  return (
    <MessagingErrorBoundary>
      <MessagingClient
        currentUserId={session.user.id!}
        initialConversations={initialConversations}
      >
        {children}
      </MessagingClient>
    </MessagingErrorBoundary>
  );
}