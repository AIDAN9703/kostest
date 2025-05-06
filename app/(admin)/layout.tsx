import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { userRoleEnum } from "@/database/schema";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Check authentication and authorization
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/admin");
  }
  
  // Check if user is an admin
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <AdminHeader user={session.user} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 