import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileSidebar } from "@/features/profile/components/ProfileSidebar";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/shared/components/layouts/Navigation";
import { getUserById } from "@/features/users/actions/user-actions";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Use service method instead of direct DB query
  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Home Button - Top Left */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Home</span>
            </Link>
          </div>

          {/* Main Content Area with Sidebar */}
          <div className="flex flex-col sm:flex-row gap-8">
            {/* Sidebar */}
            <ProfileSidebar
              user={{
                profileImage: user.profileImage,
                displayName: user.displayName,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
              }}
            />

            {/* Vertical Separator - hidden on mobile */}
            <div className="hidden sm:block w-px bg-gray-200 flex-shrink-0" />

            {/* Content Area */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
