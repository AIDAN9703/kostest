import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { userService } from "@/features/users/user.service";
import { UserProfileHeader } from "@/features/users/components/UserProfileHeader";
import { UserDetails } from "@/features/users/components/UserDetails";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

// Add revalidation to improve performance
export const revalidate = 30;

export async function generateMetadata({ params }: UserDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await userService.getUserById(resolvedParams.id).catch(() => null);
  
  const userName = user 
    ? user.displayName || user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' 
    : 'User';
  
  return {
    title: `${userName} | Admin Dashboard`,
    description: `View ${userName}'s information`
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
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
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-gray-500">View user information</p>
        </div>
      </div>

      {/* User Profile with Suspense for progressive loading */}
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile userId={userId} />
      </Suspense>
    </div>
  );
}

// Separate component for data fetching to enable Suspense
async function UserProfile({ userId }: { userId: string }) {
  const user = await userService.getUserById(userId).catch(() => null);
  
  if (!user) {
    notFound();
  }
  
  return (
    <>
      {/* User Profile Header */}
      <UserProfileHeader user={user} />
      
      {/* User Details */}
      <UserDetails user={user} />
    </>
  );
}

// Skeleton UI for loading state
function ProfileSkeleton() {
  return (
    <>
      <div className="rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </>
  );
} 