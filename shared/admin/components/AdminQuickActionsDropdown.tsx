"use client";

import Link from "next/link";
import { Plus, Ship, Calendar, Users2, User, PenLine, PartyPopper } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { ADMIN_QUICK_ACTIONS } from "@/shared/lib/constants/navigation-data";

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Create Boat": Ship,
  "Create Booking": Calendar,
  "Create Booking Group": Users2,
  "Create User": User,
  "Create Blog Post": PenLine,
  "Create Event": PartyPopper,
};

export function AdminQuickActionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="group/toggle size-8"
          aria-label="Quick actions"
          title="Quick actions"
        >
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {ADMIN_QUICK_ACTIONS.map((action) => {
          const Icon = ACTION_ICONS[action.label];
          return (
            <DropdownMenuItem key={action.href} asChild>
              <Link href={action.href} className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {action.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
