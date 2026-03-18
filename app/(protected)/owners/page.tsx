import { redirect } from "next/navigation";
import { requireOwner } from "@/shared/lib/utils/auth-utils";
import { userService } from "@/features/users/user.service";
import { OwnerDashboard } from "@/features/profile/components/OwnerDashboard";

export default async function OwnersPortalPage() {
  const session = await requireOwner();

  const user = await userService.getUserById(session.user.id);

  if (!user) {
    redirect("/sign-up");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Owners Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Owner"}
          </p>
        </div>
        <OwnerDashboard userId={user.id} />
      </div>
    </div>
  );
}
