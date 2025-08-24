"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

/**
 * @deprecated This component is no longer used in the booking flow.
 * Auth handling is now done via BookingAuthModal for a better user experience.
 * Consider removing this component if not used elsewhere.
 */
export default function BookingAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const current = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    const callbackUrl = encodeURIComponent(current);
    router.replace(`/sign-in?callbackUrl=${callbackUrl}`);
  }, [pathname, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-600">Redirecting to sign in…</div>
    </div>
  );
}

