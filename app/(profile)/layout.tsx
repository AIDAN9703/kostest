import { ReactNode } from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { Toaster } from '@/components/ui/toaster';

// Simple error boundary component
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
      <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        We encountered an error while loading this page. Please try refreshing the page.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const session = await auth();

    // Redirect to sign-in if not authenticated
    if (!session?.user) {
      redirect("/sign-in");
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <ProfileSidebar user={session.user} />
        
        <main className="min-h-screen lg:ml-[250px]">
          {children}
        </main>
        
        <Toaster />
      </div>
    );
  } catch (error) {
    console.error("Profile layout error:", error);
    return <ErrorFallback />;
  }
} 