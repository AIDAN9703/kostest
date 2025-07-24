import { ReactNode } from "react";
import { auth } from "@/auth";
import AdminSidebar from "@/features-admin/_layout/AdminSidebar";
import AdminHeader from "@/features-admin/_layout/AdminHeader";
import { FloatingActionButton } from "@/features-admin/_layout/FloatingActionButton";


export default async function AdminLayout({ children }: { children: ReactNode }) {
  // ✅ Get session for AdminHeader - auth already checked by middleware
  const session = await auth();
  
  if (!session) {
    return null; // This shouldn't happen due to middleware
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - fixed position */}
      <AdminSidebar />
      
      {/* Main Content - with left margin for sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <AdminHeader session={session} />
        
        {/* Main content area - scrollable */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
} 