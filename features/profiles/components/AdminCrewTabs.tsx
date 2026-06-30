"use client";

import Link from "next/link";
import { Anchor, UsersRound } from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";

export type CrewPageTab = "crew" | "captains";

const TABS: { id: CrewPageTab; label: string; href: string; icon: typeof UsersRound }[] = [
  { id: "crew", label: "Crew", href: "/admin/crew", icon: UsersRound },
  { id: "captains", label: "Captains", href: "/admin/crew?tab=captains", icon: Anchor },
];

export function AdminCrewTabs({ activeTab }: { activeTab: CrewPageTab }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
      {TABS.map(({ id, label, href, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
