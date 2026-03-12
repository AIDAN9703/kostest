import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";

export default function BookingsLoading() {
  return (
    <AdminTableWrapper>
      <div className="flex items-center gap-4 p-6 border-b border-border animate-pulse">
        <div className="h-9 flex-1 max-w-xs rounded-lg bg-muted" />
        <div className="h-9 w-32 rounded-lg bg-muted" />
      </div>
      <div className="flex items-center justify-center p-12">
        <div className="h-12 w-12 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </AdminTableWrapper>
  );
}
