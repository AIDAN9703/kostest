import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserById } from "@/lib/actions/admin/users";
import { UserForm } from "@/components/admin/users/CreateUserForm";
import { notFound } from "next/navigation";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserEditPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await getUserById(resolvedParams.id).catch(() => null);
  
  const userName = user 
    ? user.displayName || user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' 
    : 'User';
  
  return {
    title: `Edit ${userName} | Admin Dashboard`,
    description: `Edit ${userName}'s information`
  };
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  const user = await getUserById(userId).catch(() => null);
  
  if (!user) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/users/${userId}`}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-gray-500">Update user information</p>
        </div>
      </div>
      
      {/* User Edit Form */}
      <UserForm user={user} userId={userId} />
    </div>
  );
} 