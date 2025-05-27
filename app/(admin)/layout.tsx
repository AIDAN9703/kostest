import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { FloatingActionButton } from "@/components/admin/FloatingActionButton";

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
      {/* Sidebar - fixed position */}
      <AdminSidebar />
      
      {/* Main Content - with left margin for sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <AdminHeader user={session.user} />
        
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