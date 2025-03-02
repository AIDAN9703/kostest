import { ReactNode } from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { Toaster } from '@/components/ui/toaster';

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <ProfileSidebar user={session.user} />
      <div className="flex-1 bg-gray-50 bg-[url('/assets/subtle-pattern.svg')] bg-repeat">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
} 