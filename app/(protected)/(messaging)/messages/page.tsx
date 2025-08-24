import { Metadata } from "next";
import { MessagingInterface } from "@/features/messaging/components/MessagingInterface";

export const metadata: Metadata = {
  title: "Messages | KOS",
  description: "Communicate with boat owners, captains, and support team",
};

export default async function MessagesPage() {
  return <MessagingInterface />;
} 