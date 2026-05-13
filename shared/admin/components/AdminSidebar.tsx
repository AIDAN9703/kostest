"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import { adminThemedSidebarFrame } from "@/shared/admin/admin-themed-frame";
import { ADMIN_NAV_ITEMS } from "@/shared/lib/constants/navigation-data";
import { cn } from "@/shared/lib/utils/general-utils";
import { LogOut } from "lucide-react";

const navItemButton =
  "h-11 gap-3 rounded-lg px-3 text-base leading-snug text-sidebar-foreground/90 transition-[background-color,box-shadow,color] hover:bg-sidebar-accent/80 data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-sidebar-foreground data-[active=true]:ring-1 data-[active=true]:ring-primary/35 dark:data-[active=true]:bg-primary/25 dark:data-[active=true]:ring-2 dark:data-[active=true]:ring-primary/50 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:[&_.sidebar-label]:hidden";

/**
 * Header height matches SidebarInset (`AdminHeader`): h-16 expanded, h-12 when icon-collapsed,
 * box-border so the divider lines up with the main bar.
 */
export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn(
          "box-border flex h-16 shrink-0 flex-col justify-center gap-0 border-b border-sidebar-border bg-sidebar p-0 transition-[height,padding] duration-200 ease-linear",
          "group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:px-0"
        )}
      >
        <div className="flex w-full items-center gap-2 px-4 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/"
            className={cn(
              "relative flex size-8 shrink-0 items-center justify-center overflow-hidden outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2",
              adminThemedSidebarFrame()
            )}
            aria-label="Home"
          >
            <Image
              src="/icons/logo.png"
              alt=""
              width={28}
              height={28}
              className="size-7 object-contain"
            />
          </Link>
          <div className="min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-base font-semibold tracking-tight text-sidebar-foreground">
              KOS Admin
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-4 pt-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      size="lg"
                      className={navItemButton}
                    >
                      <Link
                        href={item.href}
                        className="flex min-w-0 flex-1 items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                      >
                        <Icon
                          className={cn(
                            item.iconClassName || "h-5 w-5 shrink-0 opacity-90",
                            isActive && "opacity-100"
                          )}
                        />
                        <span className="sidebar-label truncate">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-2">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sign out"
              size="lg"
              className="h-11 rounded-lg px-3 text-base text-destructive/90 transition-colors hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:[&_.sidebar-label]:hidden"
            >
              <Link href="/api/auth/signout" className="flex w-full items-center gap-3">
                <LogOut className="h-5 w-5 shrink-0 opacity-90" />
                <span className="sidebar-label">Sign out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
