"use client";

import { useProfile, useProfileStats } from "../hooks/useProfile";
import { getUserRoleBadges } from "../utils/profile-utils";
import type { User } from "@/database/types";
import type { ProfileStats } from "../profile.api";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { DefaultUserAvatarFallback } from "@/shared/lib/utils/user-utils";
import { useSession } from "next-auth/react";
import { GiAnchor } from "react-icons/gi";

interface ProfileClientProps {
  initialUser: User;
  initialStats: ProfileStats;
}

const blogPosts = [
  {
    id: "1",
    title: "Learn how to book a charter",
    excerpt: "Learn how to book a charter with KOS",
    image: "/images/boats/motor-yacht1.jpg",
    imageAlt: "How to book a charter",
    href: "/news/how-to-book-a-charter",
  },
  {
    id: "2",
    title: "How to choose the right charter for you",
    excerpt: "Learn how to choose the right charter for you",
    image: "/images/boats/aerial6.jpg",
    imageAlt: "How to choose a charter",
    href: "/news/how-to-choose-a-charter",
  },
  {
    id: "3",
    title: "Learn how cancellations and refunds work",
    excerpt: "Learn how cancellations and refunds work",
    image: "/images/services/sales.webp",
    imageAlt: "How cancellations and refunds work",
    href: "/news/cancellations-and-refunds",
  },
];

export function ProfileClient({
  initialUser,
  initialStats,
}: ProfileClientProps) {
  const { data: session } = useSession();

  // Use React Query hooks with initial data (handles caching/refetching automatically)
  const { data: user, isLoading: userLoading } = useProfile({
    initialData: initialUser,
  });
  const { data: stats, isLoading: statsLoading } = useProfileStats({
    initialData: initialStats,
  });

  // Show loading state only if no initial data
  if (userLoading && !initialUser) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  // Get role badges for display (session is prioritized, relations are fallback)
  const roleBadges = getUserRoleBadges(user, session?.user);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Profile</h1>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 text-primary">
        {/* Left Column - User Overview */}
        <div className="lg:col-span-1">
          <div className="md:bg-white md:rounded-3xl md:p-8 md:shadow-sm md:border md:border-gray-200">
            {/* User Info Card */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200 mb-6">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={user.profileImage || undefined}
                    alt="User profile image"
                  />
                  <DefaultUserAvatarFallback size="lg" />
                </Avatar>
                {/* Verified Badge Overlay */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.16917 2.16584C6.5208 1.76019 6.95561 1.43496 7.44406 1.21223C7.93251 0.989506 8.46317 0.874491 9 0.875002C10.1308 0.875002 11.1442 1.375 11.8308 2.16584C12.3664 2.12759 12.904 2.20507 13.4069 2.39301C13.9099 2.58094 14.3666 2.87493 14.7458 3.255C15.1258 3.63422 15.4197 4.09073 15.6076 4.59355C15.7955 5.09637 15.8731 5.63373 15.835 6.16917C16.2405 6.52088 16.5656 6.95572 16.7881 7.44416C17.0107 7.93261 17.1256 8.46323 17.125 9C17.1255 9.53684 17.0105 10.0675 16.7878 10.5559C16.565 11.0444 16.2398 11.4792 15.8342 11.8308C15.8722 12.3663 15.7947 12.9036 15.6067 13.4065C15.4188 13.9093 15.1249 14.3658 14.745 14.745C14.3658 15.1249 13.9093 15.4188 13.4065 15.6067C12.9036 15.7947 12.3663 15.8722 11.8308 15.8342C11.4792 16.2398 11.0444 16.565 10.5559 16.7878C10.0675 17.0105 9.53684 17.1255 9 17.125C8.46317 17.1255 7.93251 17.0105 7.44406 16.7878C6.95561 16.565 6.5208 16.2398 6.16917 15.8342C5.63365 15.8725 5.09615 15.7952 4.59317 15.6074C4.0902 15.4196 3.63352 15.1258 3.25417 14.7458C2.87414 14.3665 2.58018 13.9099 2.39225 13.4069C2.20432 12.9039 2.12682 12.3664 2.165 11.8308C1.75951 11.4791 1.43444 11.0443 1.21186 10.5558C0.989273 10.0674 0.874389 9.53677 0.875002 9C0.875002 7.86917 1.375 6.85583 2.16584 6.16917C2.12772 5.63372 2.20525 5.09635 2.39319 4.59352C2.58112 4.09069 2.87504 3.63419 3.255 3.255C3.63419 2.87504 4.09069 2.58112 4.59352 2.39318C5.09635 2.20525 5.63373 2.12772 6.16917 2.16584ZM12.0083 7.48834C12.0583 7.42171 12.0945 7.34576 12.1147 7.26496C12.135 7.18415 12.1388 7.10012 12.1261 7.0178C12.1134 6.93547 12.0844 6.85652 12.0407 6.78558C11.9971 6.71464 11.9397 6.65315 11.8719 6.60471C11.8041 6.55627 11.7273 6.52187 11.6461 6.50353C11.5648 6.48518 11.4807 6.48326 11.3987 6.49789C11.3167 6.51251 11.2385 6.54338 11.1686 6.58868C11.0987 6.63398 11.0385 6.69279 10.9917 6.76167L8.295 10.5367L6.94167 9.18334C6.82319 9.07294 6.66649 9.01283 6.50457 9.01569C6.34265 9.01855 6.18816 9.08414 6.07365 9.19865C5.95914 9.31316 5.89355 9.46765 5.89069 9.62957C5.88783 9.79148 5.94794 9.94819 6.05834 10.0667L7.93334 11.9417C7.99749 12.0058 8.07484 12.0552 8.15999 12.0864C8.24515 12.1176 8.33608 12.1299 8.42647 12.1224C8.51686 12.115 8.60455 12.088 8.68344 12.0432C8.76234 11.9985 8.83055 11.9371 8.88334 11.8633L12.0083 7.48834Z"
                      fill="#22c55e"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-1">{user.firstName}</h2>

              {/* Role Badges */}
              {roleBadges.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2 mb-2">
                  {roleBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-gold/20 text-primary rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats - Airbnb Style */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-2xl font-semibold mb-1">
                  {stats?.totalBookings ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats?.totalBookings === 1 ? "Trip" : "Trips"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold mb-1">0</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loyalty Points Section */}
          <div className="md:bg-white md:rounded-3xl md:p-8 md:shadow-sm md:border md:border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">KOS Points</h2>
                <p className="text-sm text-muted-foreground">
                  Earn 1 KOS Point for every $1 spent on completed charters
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br bg-gold rounded-full p-1">
                  <GiAnchor className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-muted-foreground">
                    {stats?.loyaltyPoints.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar - Always shown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next reward at 100 points</span>
                <span className="text-gray-900 font-medium">
                  {100 - (stats?.loyaltyPoints ?? 0)} to go
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-gold/90 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(3, ((stats?.loyaltyPoints ?? 0) / 100) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Loyalty Info Links */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link
                  href="/rewards"
                  className="text-muted-foreground hover:text-primary underline"
                >
                  View rewards
                </Link>
                <Link
                  href="/profile/bookings"
                  className="text-muted-foreground hover:text-primary underline"
                >
                  Booking history
                </Link>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-primary underline"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>

          {/* Blog Resources Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Helpful resources</h2>
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={post.href}
                  className="block md:bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-200 md:hover:shadow-md md:transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-48 h-48 relative flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.imageAlt || post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 192px"
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-2 hover:underline">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Read more →
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
