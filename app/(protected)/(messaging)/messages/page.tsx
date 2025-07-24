import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Messages | KOS",
  description: "Communicate with boat owners, captains, and support team",
};

export default async function MessagesPage() {
 

  return (

    
    <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-primary">Messages</h1>
        <p className="text-muted-foreground">Select a conversation to start messaging, or create a new conversation.</p>
    </div>
  );
} 