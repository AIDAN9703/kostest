import { AdminListShell } from "@/shared/admin/components/AdminListShell";

export function AdminListLoading() {
  return (
    <AdminListShell
      toolbar={
        <div className="flex shrink-0 flex-wrap items-center gap-2 pb-3">
          <div className="h-9 max-w-md flex-1 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-border/60 bg-card">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    </AdminListShell>
  );
}
