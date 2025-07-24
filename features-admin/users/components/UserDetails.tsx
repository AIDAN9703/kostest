import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface UserDetailsProps {
  user: any; // Accept the full user type from database
}

export function UserDetails({ user }: UserDetailsProps) {
  // Helper to display boolean values
  const BooleanStatus = ({ value }: { value: boolean }) => (
    value ? 
      <div className="flex items-center text-green-600">
        <CheckCircle2 className="h-4 w-4 mr-1" />
        <span>Yes</span>
      </div> : 
      <div className="flex items-center text-red-600">
        <XCircle className="h-4 w-4 mr-1" />
        <span>No</span>
      </div>
  );

  // Helper to format dates
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "Not set";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">First Name</p>
            <p>{user.firstName || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Last Name</p>
            <p>{user.lastName || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Display Name</p>
            <p>{user.displayName || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Username</p>
            <p>{user.username || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Bio</p>
            <p className="whitespace-pre-wrap">{user.bio || "No bio provided"}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Contact Information */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>User's contact details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Email Address</p>
            <p>{user.email || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Phone Number</p>
            <p>{user.phoneNumber || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p>
              {user.address ? (
                <>
                  {user.address}
                  {user.city && `, ${user.city}`}
                  {user.state && `, ${user.state}`}
                  {user.postalCode && ` ${user.postalCode}`}
                  {user.country && `, ${user.country}`}
                </>
              ) : (
                "Not set"
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Details */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Account status and settings</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <Badge variant={
              user.status === 'ACTIVE' ? 'default' : 
              user.status === 'INACTIVE' ? 'secondary' : 
              'destructive'
            }>
              {user.status || "Unknown"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Role</p>
            <Badge variant="outline">{user.role || "User"}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Joined Date</p>
            <p>{formatDate(user.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Last Login</p>
            <p>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Password Changed</p>
            <p>{user.passwordChangedAt ? formatDate(user.passwordChangedAt) : "Never"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Two-Factor Authentication</p>
            <BooleanStatus value={Boolean(user.twoFactorEnabled)} />
          </div>
        </CardContent>
      </Card>
      
      {/* Verification Status */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>Verification status and details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Email Verified</p>
            <BooleanStatus value={Boolean(user.emailVerified)} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Phone Verified</p>
            <BooleanStatus value={Boolean(user.phoneVerified)} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Identity Verified</p>
            <BooleanStatus value={Boolean(user.identityVerified)} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Government ID Verified</p>
            <BooleanStatus value={Boolean(user.governmentIdVerified)} />
          </div>
          {user.boatingLicenseNumber && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Boating License Number</p>
              <p>{user.boatingLicenseNumber}</p>
            </div>
          )}
          {user.boatingLicenseExpiry && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Boating License Expiry</p>
              <p>{formatDate(user.boatingLicenseExpiry)}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Boating License Verified</p>
            <BooleanStatus value={Boolean(user.boatingLicenseVerified)} />
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Metrics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Activity metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Last Active</p>
            <p>{user.lastActiveAt ? formatDate(user.lastActiveAt) : "Never"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
            <p>{user.totalBookings || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Total Reviews</p>
            <p>{user.totalReviews || 0}</p>
          </div>
          {user.averageRating && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p>{user.averageRating.toFixed(1)} / 5.0</p>
            </div>
          )}
          {user.isBoatOwner && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Is Boat Owner</p>
                <BooleanStatus value={Boolean(user.isBoatOwner)} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Total Boats Listed</p>
                <p>{user.totalBoatsListed || 0}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}