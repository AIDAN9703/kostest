import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { userService } from "@/features/users/user.service";
import { UserForm } from "@/features/users/components/UserForm";
import { notFound } from "next/navigation";
import { type UpdateUserInput } from "@/features/users/user.validation";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

// Add revalidation to improve performance
export const revalidate = 30;

export default async function UserEditPage({ params }: UserEditPageProps) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
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
      
      {/* User Edit Form with Suspense for progressive loading */}
      <Suspense fallback={<FormSkeleton />}>
        <UserFormWithData userId={userId} />
      </Suspense>
    </div>
  );
}

// Separate component for data fetching to enable Suspense
async function UserFormWithData({ userId }: { userId: string }) {
  const userData = await userService.getUserById(userId).catch(() => null);
  
  if (!userData) {
    notFound();
  }
  
  // Format the license expiry date if it exists
  const formatLicenseExpiry = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for date input
  };
  
  // Transform database user to match the form's expected format
  // Only include fields that are in the UpdateUserInput type
  const user: Partial<UpdateUserInput> = {
    firstName: userData.firstName || null,
    lastName: userData.lastName || null,
    displayName: userData.displayName || null,
    bio: userData.bio || null,
    profileImage: userData.profileImage || null,
    username: userData.username,
    email: userData.email,
    phoneNumber: userData.phoneNumber || null,
    role: userData.role,
    status: userData.status,
    twoFactorEnabled: userData.twoFactorEnabled,
    // Only include authProvider if it's a valid value in the enum
    ...(userData.authProvider ? { authProvider: userData.authProvider } : {}),
    address: userData.address || null,
    city: userData.city || null,
    state: userData.state || null,
    postalCode: userData.postalCode || null,
    country: userData.country || null,
    emailVerified: userData.emailVerified,
    phoneVerified: userData.phoneVerified,
    identityVerified: userData.identityVerified || false,
    governmentIdVerified: userData.governmentIdVerified || false,
    boatingExperience: userData.boatingExperience,
    boatingLicenseNumber: userData.boatingLicenseNumber || null,
    boatingLicenseExpiry: formatLicenseExpiry(userData.boatingLicenseExpiry),
    boatingLicenseVerified: userData.boatingLicenseVerified || false,
    stripeCustomerId: userData.stripeCustomerId || null,
    stripeConnectAccountId: userData.stripeConnectAccountId || null,
    hasBankAccountConnected: userData.hasBankAccountConnected || false,
    marketingEmailsEnabled: userData.marketingEmailsEnabled,
  };
  
  return <UserForm user={user} userId={userId} />;
}

// Skeleton UI for the form loading state
function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((card) => (
        <div key={card} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
} 