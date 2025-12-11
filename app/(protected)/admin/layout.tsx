import { ReactNode } from "react";
import { auth } from "@/auth";
import AdminSidebar from "@/shared/admin/components/AdminSidebar";
import AdminHeader from "@/shared/admin/components/AdminHeader";
import { QueryProvider } from "@/shared/lib/providers/QueryProvider";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Middleware already checked auth, but we need session for AdminHeader
  const session = await auth();

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
          <AdminHeader session={session!} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </div>
    </div>
  );
}
