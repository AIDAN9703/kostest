import { redirect } from "next/navigation";
import { requireOwner } from "@/shared/lib/utils/auth-utils";
import { userService } from "@/features/users/user.service";

export default async function AgentsPortalPage() {
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
            Agents Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Agent"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground mt-1">Active Referrals</div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600">$0</div>
            <div className="text-sm text-muted-foreground mt-1">Commission Earned</div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-muted-foreground mt-1">Bookings Referred</div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <p className="text-sm text-blue-800">
            <strong>Coming Soon:</strong> Full agent dashboard with referral tracking,
            commission management, client bookings, and payout history.
          </p>
        </div>
      </div>
    </div>
  );
}
