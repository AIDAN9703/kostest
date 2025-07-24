import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import ProfileSettingsForm from "@/features/profile/components/ProfileSettingsForm";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { UserProfile } from "@/shared/types/types";
import { redirect } from "next/navigation";

// Sign Out Section Component
const SignOutSection = () => (
  <Card className="border-gray-200 shadow-sm">
    <CardContent className="p-4 md:p-6">
      <div className="flex flex-col space-y-3">
        <h3 className="text-lg font-medium text-destructive">Sign Out</h3>
        <p className="text-sm text-gray-500">
          Sign out of your account. You will need to sign in again to access your profile.
        </p>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full md:w-auto border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </CardContent>
  </Card>
);

export default async function SettingsPage() {
  // Get session - auth already checked by middleware
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  
  // Fetch full user data for the form
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  
  const user = userData[0] as UserProfile;
  if (!user) {
    return null;
  }

  return (
    <div className="p-4 pt-16 md:p-6 lg:pt-6 space-y-6 animate-fadeIn">    
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
          <ProfileSettingsForm user={user} />
        </CardContent>
      </Card>
      
      <SignOutSection />
    </div>
  );
} 