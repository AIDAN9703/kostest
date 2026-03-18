import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const url = req.nextUrl;
  const pathname = url.pathname;

  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.isAdmin === true;

  // ==========================================
  // SUBDOMAIN ROUTING (production only)
  // Cookies don't share across subdomains on localhost,
  // so this only runs in production where .kosyachts.com cookie works.
  // ==========================================

  if (process.env.NODE_ENV === "production") {
    const hostname = req.headers.get("host") || "";
    const subdomain = hostname.replace(".kosyachts.com", "");

    if (subdomain === "admin") {
      if (!isLoggedIn) return NextResponse.redirect(new URL("/sign-in", "https://www.kosyachts.com"));
      if (!isAdmin) return NextResponse.redirect(new URL("/403", "https://www.kosyachts.com"));
      return NextResponse.rewrite(new URL(`/admin${pathname}${url.search}`, req.url));
    }

    if (subdomain === "captains") {
      if (!isLoggedIn) return NextResponse.redirect(new URL("/sign-in", "https://www.kosyachts.com"));
      if (!session?.user?.isCaptain) return NextResponse.redirect(new URL("/403", "https://www.kosyachts.com"));
      return NextResponse.rewrite(new URL(`/captains${pathname}${url.search}`, req.url));
    }

    if (subdomain === "agents") {
      if (!isLoggedIn) return NextResponse.redirect(new URL("/sign-in", "https://www.kosyachts.com"));
      if (!session?.user?.isOwner) return NextResponse.redirect(new URL("/403", "https://www.kosyachts.com"));
      return NextResponse.rewrite(new URL(`/agents${pathname}${url.search}`, req.url));
    }

    if (subdomain === "owners") {
      if (!isLoggedIn) return NextResponse.redirect(new URL("/sign-in", "https://www.kosyachts.com"));
      if (!session?.user?.isOwner) return NextResponse.redirect(new URL("/403", "https://www.kosyachts.com"));
      return NextResponse.rewrite(new URL(`/owners${pathname}${url.search}`, req.url));
    }
  }

  // ==========================================
  // MAIN DOMAIN ROUTING
  // ==========================================

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

  if (pathname.startsWith("/profile") || pathname.startsWith("/bookings")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  if (pathname.startsWith("/api/users/profile") || pathname.startsWith("/api/users/stats")) {
    if (!isLoggedIn) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

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
