import { ReactNode } from "react";
import { auth } from "@/auth";
import AdminSidebar from "@/features-admin/_layout/AdminSidebar";
import AdminHeader from "@/features-admin/_layout/AdminHeader";
import { FloatingActionButton } from "@/features-admin/_layout/FloatingActionButton";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar - Never moves */}
      <div className="fixed left-0 top-0 h-full z-20">
        <AdminSidebar />
      </div>
      
      {/* Main Content Area - Offset by sidebar width */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Fixed Header - Never moves */}
        <div className="fixed top-0 left-64 right-0 h-16 z-10">
          <AdminHeader session={session} />
        </div>
        
        {/* Scrollable Content Area - Offset by header height */}
        <div className="flex-1 mt-16">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
} 