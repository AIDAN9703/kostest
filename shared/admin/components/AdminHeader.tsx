"use client";

import { Session } from "next-auth";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Breadcrumbs } from "@/shared/admin/components/breadcrumbs";
import SearchInput from "@/shared/admin/components/search-input";
import { AdminQuickActionsDropdown } from "@/shared/admin/components/AdminQuickActionsDropdown";
import { AdminUserNav } from "@/shared/admin/components/admin-user-nav";
import { ModeToggle } from "@/shared/admin/components/mode-toggle";
import { ThemeSelector } from "@/shared/admin/components/theme-selector";

export default function AdminHeader({
  session,
}: {
  session: Session | null;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 px-4">
        <AdminQuickActionsDropdown />
        <div className="hidden md:flex">
          <SearchInput />
        </div>
        <AdminUserNav
          user={
            session?.user
              ? {
                  name: session.user.name ?? null,
                  email: session.user.email ?? null,
                  image: session.user.image ?? null,
                }
              : undefined
          }
        />
        <ModeToggle />
        <ThemeSelector />
      </div>
    </header>
  );
}

