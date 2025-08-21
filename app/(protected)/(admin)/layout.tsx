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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="group">
        <AdminSidebar />
      </div>

      {/* Main Content Area - Automatically takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Full width of content area */}
        <div className="flex-shrink-0">
          <AdminHeader session={session} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
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