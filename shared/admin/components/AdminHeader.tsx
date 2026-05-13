"use client";

import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Breadcrumbs } from "@/shared/admin/components/breadcrumbs";
import SearchInput from "@/shared/admin/components/search-input";
import { AdminQuickActionsDropdown } from "@/shared/admin/components/AdminQuickActionsDropdown";
import { ModeToggle } from "@/shared/admin/components/mode-toggle";
import { ThemeSelector } from "@/shared/admin/components/theme-selector";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 box-border flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background py-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 group-has-data-[collapsible=icon]/sidebar-wrapper:py-1.5">
      <div className="flex min-w-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>

      <div className="flex min-w-0 items-center gap-2 px-4 sm:gap-3">
        <AdminQuickActionsDropdown />
        <div className="hidden md:flex">
          <SearchInput />
        </div>
        <ModeToggle />
        <ThemeSelector />
      </div>
    </header>
  );
}
