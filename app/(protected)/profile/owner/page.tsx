import { redirect } from "next/navigation";
import { requireOwner } from "@/shared/lib/utils/auth-utils";
import { userService } from "@/features/users/user.service";
import { OwnerDashboard } from "@/features/profile/components/OwnerDashboard";

/**
 * Owner Dashboard Page
 *
 * Separate route for owner-specific features.
 * Users can switch to this view using the role switcher in the navbar.
 */
export default async function OwnerPage() {
  // Require owner role - redirects to /profile if not owner
  const session = await requireOwner();

  // Get user data (could include owner profile relations if needed)
  const user = await userService.getUserById(session.user.id, {
    // ownerProfile: true, // Add when ownerProfile relation is available
  });

  if (!user) {
    redirect("/sign-up");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Owner Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your fleet and track your business
        </p>
      </div>

      {/* Owner Dashboard */}
      <OwnerDashboard userId={user.id} />
    </div>
  );
}
