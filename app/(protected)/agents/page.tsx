import { requireAuth } from "@/shared/lib/utils/auth-utils";

export default async function AgentsPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Agent Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your bookings and commissions
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-muted-foreground">
          Welcome, {session.user.name}. Your agent dashboard is being set up.
        </p>
      </div>
    </div>
  );
}
