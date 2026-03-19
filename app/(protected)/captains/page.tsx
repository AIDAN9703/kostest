import { requireCaptain } from "@/shared/lib/utils/auth-utils";

export default async function CaptainsPage() {
  const session = await requireCaptain();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Captain Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your captain profile and assignments
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-muted-foreground">
          Welcome, {session.user.name}. Your captain dashboard is being set up.
        </p>
      </div>
    </div>
  );
}
