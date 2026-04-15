"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { OpsRowContent, type OpsRowContentProps } from "@/features/bookings/components/admin/OpsRowContent";

/**
 * Same ops field layout as Admin → All (inline cells + status flags).
 */
export function AdminBookingOpsSection(props: OpsRowContentProps) {
  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Ops</CardTitle>
        <p className="text-xs text-muted-foreground">
          Same fields as the &ldquo;All&rdquo; table — edits save when you leave each field.
        </p>
      </CardHeader>
      <CardContent>
        <OpsRowContent {...props} density="comfortable" />
      </CardContent>
    </Card>
  );
}
