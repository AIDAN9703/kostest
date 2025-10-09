import { ReactNode } from "react";
import { auth } from "@/auth";
import AdminSidebar from "@/shared/layouts/AdminSidebar";
import AdminHeader from "@/shared/layouts/AdminHeader";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="group">
        <AdminSidebar />
      </div>

      {/* Main Content Area - Automatically takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Full width of content area */}
        <div className="shrink-0">
          <AdminHeader session={session} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <QueryProvider>
            {children}
          </QueryProvider>
        </div>
      </div>
    </div>
  );
} 