import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/lib/utils/auth-utils";
import { AccountSettings } from "@/features/profile/components/AccountSettings";
import { LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { UserProfile } from "@/features/profile/profile.types";
import { userService } from "@/features/users/user.service";

const SignOutSection = () => (
  <div className="pt-6 border-t border-gray-200 mt-8">
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
  // Require authentication - middleware already protects this route
  const session = await requireAuth();

  // Fetch full user data for the form using service method directly
  const userData = await userService.getUserById(session.user.id);

  if (!userData) {
    redirect("/sign-in");
  }

  const user = userData as UserProfile;

  return (
    <div className="space-y-6">
      <AccountSettings user={user} />
      <SignOutSection />
    </div>
  );
}
