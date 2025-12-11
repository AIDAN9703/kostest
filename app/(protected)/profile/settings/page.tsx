import { auth } from "@/auth";
import ProfileSettingsForm from "@/features/profile/components/ProfileSettingsForm";
import { LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { UserProfile } from "@/features/users/user.types";
import { redirect } from "next/navigation";
import { getUserById } from "@/features/users/actions/user-actions";

const SignOutSection = () => (
  <div className="pt-6 border-t border-gray-200">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 className="font-medium text-gray-900">Sign Out</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sign out of your account
        </p>
      </div>
      <form action={signOutAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </form>
    </div>
  </div>
);

export default async function SettingsPage() {
  // Get session - auth already checked by middleware
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch full user data for the form using service method
  const userData = await getUserById(session.user.id);
  
  if (!userData) {
    redirect("/sign-in");
  }

  const user = userData as UserProfile;

  return (
    <div className="space-y-6">
      <ProfileSettingsForm user={user} />
      <SignOutSection />
    </div>
  );
}
