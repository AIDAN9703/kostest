import { ReactNode } from "react";
import { requireAdmin } from "@/shared/lib/utils/auth-utils";
import AdminSidebar from "@/shared/admin/components/AdminSidebar";
import AdminHeader from "@/shared/admin/components/AdminHeader";
import { QueryProvider } from "@/shared/lib/providers/QueryProvider";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import KBar from "@/shared/admin/components/kbar";
import { ThemeProvider } from "next-themes";
import { AdminAccentThemeProvider } from "@/shared/admin/admin-accent-theme";
import {
  ADMIN_ACCENT_THEME_COOKIE,
  normalizeAdminAccentTheme,
} from "@/shared/admin/admin-accent-theme.config";
import { cn } from "@/shared/lib/utils/general-utils";
import { cookies } from "next/headers";
import "./admin-theme.css";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: middleware checks admin too, but never rely on it alone.
  await requireAdmin();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const activeThemeValue = normalizeAdminAccentTheme(
    cookieStore.get(ADMIN_ACCENT_THEME_COOKIE)?.value
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AdminAccentThemeProvider initialTheme={activeThemeValue}>
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
      </AdminAccentThemeProvider>
    </ThemeProvider>
  );
}
