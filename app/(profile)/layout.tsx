import { ReactNode } from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/navigation/Navigation';
import BackToDashboard from '@/components/profile/BackToDashboard';
// Simple error boundary component
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-primary/5">
    <div className="text-center p-8 bg-white rounded-xl shadow-md border border-primary/10 max-w-md">
      <h2 className="text-2xl font-bold text-red-600 mb-3">Something went wrong</h2>
      <p className="text-primary/70 mb-6">
        We encountered an error while loading this page. Please try refreshing the page.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
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
      <>
        <Navigation session={session} />
        <div className="min-h-screen pt-20 pb-6 max-w-5xl mx-auto">
        <BackToDashboard />
          <main className="min-h-screen">
            {children}
          </main>
          
          <Toaster />
        </div>
      </>
    );
  } catch (error) {
    console.error("Profile layout error:", error);
    return <ErrorFallback />;
  }
} 