import { ReactNode } from 'react';
import { Toaster } from '@/shared/components/ui/toaster';
import Navigation from '@/shared/components/layout/Navigation';
import BackToDashboard from '@/features/profile/components/BackToDashboard';

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