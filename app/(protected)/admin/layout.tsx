import { ReactNode } from "react";
import { requireAuth } from "@/shared/lib/utils/auth-utils";
import AdminSidebar from "@/shared/admin/components/AdminSidebar";
import AdminHeader from "@/shared/admin/components/AdminHeader";
import { QueryProvider } from "@/shared/lib/providers/QueryProvider";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import KBar from "@/shared/admin/components/kbar";
import ThemeProvider from "@/shared/admin/components/theme-provider";
import { ActiveThemeProvider } from "@/shared/admin/components/active-theme";
import { cn } from "@/shared/lib/utils/general-utils";
import { cookies } from "next/headers";
import "./admin-theme.css";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Require authentication - middleware already protects this route
  await requireAuth();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const activeThemeValue = cookieStore.get("admin_active_theme")?.value ?? "default";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <KBar>
          <SidebarProvider
            defaultOpen={defaultOpen}
            data-admin-theme
            className={cn(
              "admin-theme bg-background text-foreground font-sans antialiased h-svh overflow-hidden",
              activeThemeValue ? `theme-${activeThemeValue}` : ""
            )}
          >
            <AdminSidebar />
            <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AdminHeader />
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-8">
                <QueryProvider>
                  <div className="flex h-full min-h-0 w-full flex-col">{children}</div>
                </QueryProvider>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </KBar>
      </ActiveThemeProvider>
    </ThemeProvider>
  );
}
