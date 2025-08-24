import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

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

  /* 
  TODO: Hook up to actual messaging system later
  
  To integrate with your existing messaging system:
  1. Uncomment the imports for MessagingClient and MessagingErrorBoundary
  2. Fetch initial conversations using getConversations action
  3. Pass currentUserId and initialConversations to MessagingClient
  4. Wrap everything in MessagingErrorBoundary for error handling
  
  Example:
  const result = await getConversations({}, { page: 1, limit: 50 });
  <MessagingClient currentUserId={session.user.id} initialConversations={result}>
    {children}
  </MessagingClient>
  */

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {children}
    </div>
  );
}