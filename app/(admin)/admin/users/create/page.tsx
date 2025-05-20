import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserForm } from "@/components/admin/users/UserForm";

export const metadata: Metadata = {
  title: "Create User | Admin Dashboard",
  description: "Create a new user account",
};

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-gray-500">Add a new user to the platform</p>
        </div>
      </div>
      
      {/* User Creation Form */}
      <UserForm />
    </div>
  );
} 