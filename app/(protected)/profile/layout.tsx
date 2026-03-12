import { ReactNode } from "react";
import { requireAuth } from "@/shared/lib/utils/auth-utils";
import { ProfileNavbar } from "@/features/profile/components/ProfileNavbar";
import { QueryProvider } from "@/shared/lib/providers/QueryProvider";

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Require authentication - middleware already protects this route
  const session = await requireAuth();

  return (
    <QueryProvider>
      {/* Profile Navbar */}
      <ProfileNavbar user={session.user} />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-poppins text-primary">
        <main>{children}</main>
      </div>
    </QueryProvider>
  );
}
