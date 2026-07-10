"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, X } from "lucide-react";

import { assignInquiry } from "@/features/inquiries/inquiry.actions";
import {
  adminDisplayName,
  adminInitials,
  type AdminOption,
} from "@/features/inquiries/inquiry-ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

interface AssignInquiryMenuProps {
  inquiryId: string;
  admins: AdminOption[];
  /** When set, shows an "Unassign" option in the menu. */
  currentAssigneeId?: string | null;
  triggerLabel?: string;
  triggerClassName?: string;
}

/** Assign-to-admin dropdown, shared by the dashboard queue and inquiry pages. */
export function AssignInquiryMenu({
  inquiryId,
  admins,
  currentAssigneeId = null,
  triggerLabel = "Assign",
  triggerClassName,
}: AssignInquiryMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function assign(admin: AdminOption | null) {
    setPending(true);
    const res = await assignInquiry(inquiryId, admin?.id ?? null);
    setPending(false);
    if (res.success) {
      toast({
        title: admin ? `Assigned to ${adminDisplayName(admin)} ✓` : "Unassigned",
      });
      router.refresh();
    } else {
      toast({
        title: "Couldn't assign",
        description: res.error,
        variant: "destructive",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending || admins.length === 0}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50",
            triggerClassName
          )}
        >
          <UserPlus className="h-3.5 w-3.5" />
          {pending ? "Assigning…" : triggerLabel}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> Assign to
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {admins.map((admin) => {
          const name = adminDisplayName(admin);
          return (
            <DropdownMenuItem key={admin.id} onSelect={() => assign(admin)} className="gap-2">
              <Avatar className="h-6 w-6">
                {admin.profileImage ? <AvatarImage src={admin.profileImage} alt={name} /> : null}
                <AvatarFallback className="text-[10px]">{adminInitials(name)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{name}</span>
            </DropdownMenuItem>
          );
        })}
        {currentAssigneeId ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => assign(null)} className="gap-2 text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Unassign
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
