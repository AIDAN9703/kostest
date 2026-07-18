"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, UserCheck } from "lucide-react";

import { assignAdminToBooking } from "@/features/bookings/actions/admin-booking.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";
import {
  adminDisplayName,
  type AdminOption,
} from "@/shared/lib/utils/people-display";

interface AssignDealMenuProps {
  bookingId: string;
  admins: AdminOption[];
  currentAssigneeId?: string | null;
  triggerLabel?: string;
  triggerClassName?: string;
}

/** Assign (or unassign) a deal to an admin — the dashboard queue's control. */
export function AssignDealMenu({
  bookingId,
  admins,
  currentAssigneeId = null,
  triggerLabel = "Assign",
  triggerClassName,
}: AssignDealMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function assign(adminId: string | null) {
    if (pending) return;
    setPending(true);
    const res = await assignAdminToBooking(bookingId, adminId);
    setPending(false);
    if (res.success) {
      router.refresh();
    } else {
      toast({ title: "Couldn't assign deal", description: res.error, variant: "destructive" });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          className={cn(
            "relative z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted",
            triggerClassName
          )}
        >
          <UserCheck className="h-3 w-3" />
          {pending ? "Assigning…" : triggerLabel}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {admins.length === 0 ? (
          <DropdownMenuItem disabled>No admins available</DropdownMenuItem>
        ) : (
          admins.map((admin) => (
            <DropdownMenuItem
              key={admin.id}
              disabled={admin.id === currentAssigneeId}
              onClick={() => assign(admin.id)}
              className="cursor-pointer"
            >
              {adminDisplayName(admin)}
            </DropdownMenuItem>
          ))
        )}
        {currentAssigneeId ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => assign(null)} className="cursor-pointer">
              Unassign
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
