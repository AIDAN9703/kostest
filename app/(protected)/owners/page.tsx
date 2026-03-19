import { requireOwner } from "@/shared/lib/utils/auth-utils";

export default async function OwnersPage() {
  const session = await requireOwner();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Owner Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your fleet and track your business
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-muted-foreground">
          Welcome, {session.user.name}. Your owner dashboard is being set up.
        </p>
      </div>
    </div>
  );
}
