import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/navigation/Navigation';
import BackToDashboard from '@/components/profile/BackToDashboard';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  // ✅ No auth check needed - handled by parent layout and middleware
  
  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-20 pb-8 max-w-6xl mx-auto px-4 sm:px-6">
        <BackToDashboard />
        <main className="min-h-screen mt-4">
          {children}
        </main>
        <Toaster />
      </div>
    </>
  );
} 