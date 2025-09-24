import { ReactNode } from "react";
import { auth } from "@/auth";
import AdminSidebar from "@/features-admin/_layout/AdminSidebar";
import AdminHeader from "@/features-admin/_layout/AdminHeader";
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 min-h-full">
            <div className="mx-auto bg-white rounded-3xl shadow-xs border border-gray-200/70 p-6">
              <QueryProvider>
                {children}
              </QueryProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 