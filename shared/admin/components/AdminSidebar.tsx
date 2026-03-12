"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ADMIN_NAV_GROUPS, ADMIN_DASHBOARD_LINK } from "@/shared/lib/constants/navigation-data";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icons/logo.png"
              alt="KOS Yachts Admin"
              width={36}
              height={36}
            />
          </Link>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold sidebar-label">
              KOS Admin
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="divide-y divide-sidebar-border/60">
            <SidebarMenuItem className="py-0.5">
              <SidebarMenuButton
                asChild
                tooltip={ADMIN_DASHBOARD_LINK.label}
                isActive={pathname === ADMIN_DASHBOARD_LINK.href}
                className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&_.sidebar-label]:hidden"
              >
                <Link href={ADMIN_DASHBOARD_LINK.href}>
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="sidebar-label">{ADMIN_DASHBOARD_LINK.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {ADMIN_NAV_GROUPS.map((group) => (
              <Collapsible
                  key={group.title}
                  asChild
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarMenuItem className="py-0.5">
                    {isCollapsed ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <SidebarMenuButton
                            tooltip={group.title}
                            className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&_.sidebar-label]:hidden"
                          >
                            {group.icon && (
                              <group.icon
                                className={group.iconClassName || "size-4"}
                              />
                            )}
                            <span className="sidebar-label">{group.title}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 sidebar-label" />
                          </SidebarMenuButton>
                        </PopoverTrigger>
                        <PopoverContent
                          side="right"
                          align="start"
                          sideOffset={8}
                          className="w-48 p-1"
                        >
                          <nav className="flex flex-col gap-0.5">
                            {group.items.map((item) => {
                              const isItemActive = pathname === item.href;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`flex items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                                    isItemActive
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground/70"
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              );
                            })}
                          </nav>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={group.title}
                            className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&_.sidebar-label]:hidden"
                          >
                            {group.icon && (
                              <group.icon
                                className={group.iconClassName || "size-4"}
                              />
                            )}
                            <span className="sidebar-label">{group.title}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 sidebar-label" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {group.items.map((item) => {
                              const isItemActive = pathname === item.href;
                              return (
                                <SidebarMenuSubItem key={item.href}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isItemActive}
                                  >
                                    <Link href={item.href}>
                                      <span className="sidebar-label admin-hover-underline">
                                        {item.label}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sign Out"
              className="text-destructive group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&_.sidebar-label]:hidden"
            >
              <Link href="/api/auth/signout">
                <span className="sidebar-label">Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
