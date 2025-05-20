import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserById } from "@/lib/actions/admin/users";
import { UserForm } from "@/components/admin/users/UserForm";
import { notFound } from "next/navigation";
import { type UpdateUserInput } from "@/lib/validation/admin/users";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  const userData = await getUserById(userId).catch(() => null);
  
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