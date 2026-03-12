import { redirect } from "next/navigation";
import { requireCaptain } from "@/shared/lib/utils/auth-utils";
import { userService } from "@/features/users/user.service";
import { CaptainDashboard } from "@/features/profile/components/CaptainDashboard";

/**
 * Captain Dashboard Page
 *
 * Separate route for captain-specific features.
 * Users can switch to this view using the role switcher in the navbar.
 */
export default async function CaptainPage() {
  // Require captain role - redirects to /profile if not captain
  const session = await requireCaptain();

  // Get user data (could include captain profile relations if needed)
  const user = await userService.getUserById(session.user.id, {
    captainProfile: true,
  });

  if (!user) {
    redirect("/sign-up");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Captain Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your captain profile and assignments
        </p>
      </div>

      {/* Captain Dashboard */}
      <CaptainDashboard userId={user.id} />
    </div>
  );
}
