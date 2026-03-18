import { redirect } from "next/navigation";
import { requireCaptain } from "@/shared/lib/utils/auth-utils";
import { userService } from "@/features/users/user.service";
import { CaptainDashboard } from "@/features/profile/components/CaptainDashboard";

export default async function CaptainsPortalPage() {
  const session = await requireCaptain();

  const user = await userService.getUserById(session.user.id, {
    captainProfile: true,
  });

  if (!user) {
    redirect("/sign-up");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Captains Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Captain"}
          </p>
        </div>
        <CaptainDashboard userId={user.id} />
      </div>
    </div>
  );
}
