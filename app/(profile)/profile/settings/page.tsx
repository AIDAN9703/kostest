import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";
import { UserProfile } from "@/types/types";
import { Settings } from "lucide-react";
import { Suspense } from "react";

// Settings header component
const SettingsHeader = () => (
  <div className="bg-gradient-to-r from-primary/90 to-primary rounded-lg p-4 md:p-6 text-white shadow-sm">
    <h1 className="text-xl md:text-2xl font-bold">Account Settings</h1>
    <p className="mt-1 text-white/90 text-sm md:text-base">Manage your account settings and preferences</p>
  </div>
);

// Loading fallback component
const SettingsSkeleton = () => (
  <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6">
    <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
    <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
  </div>
);

// Settings content component
const SettingsContent = ({ user }: { user: UserProfile }) => (
  <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6 animate-fadeIn">
    <SettingsHeader />
    
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Settings className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Profile Information
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Update your personal information and profile details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {user && <ProfileSettingsForm user={user} />}
      </CardContent>
    </Card>
  </div>
);

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  // Fetch user data from database to get complete profile
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const user = userData[0] ? userData[0] as unknown as UserProfile : null;

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      {user && <SettingsContent user={user} />}
    </Suspense>
  );
} 