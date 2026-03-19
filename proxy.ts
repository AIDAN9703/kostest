import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.isAdmin === true;

  // Protect admin routes — require auth + admin role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  // Protect profile and booking routes — require auth
  if (pathname.startsWith("/profile") || pathname.startsWith("/bookings")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // Protect user-specific API routes
  if (pathname.startsWith("/api/users/profile") || pathname.startsWith("/api/users/stats")) {
    if (!isLoggedIn) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Protect upload API
  if (pathname.startsWith("/api/upload")) {
    if (!isLoggedIn) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/webhook|api/auth|api/boats/[^/]+/availability|api/boats/[^/]+/calendar|api/events|api/users/[^/]+$).*)",
  ],
};
