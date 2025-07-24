import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getConversations } from "@/features/messaging/actions";
import { AdminMessagingLayout } from "@/features-admin/messaging/components";

export const metadata: Metadata = {
  title: "Message Management | Admin",
  description: "Manage all conversations and messages across the platform",
};

export default async function AdminMessagesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Load all conversations for admin view
  let initialConversations;
  try {
    const result = await getConversations(
      {}, // No filters - show all conversations
      { page: 1, limit: 100 } // Larger limit for admin
    );
    if ('conversations' in result) {
      initialConversations = result;
    }
  } catch (error) {
    console.error("Error loading admin conversations:", error);
  }

  return (
    <AdminMessagingLayout
      currentUserId={session.user.id!}
      initialConversations={initialConversations}
    />
  );
}