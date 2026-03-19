import { auth } from "@/auth";
import { NextResponse } from "next/server";

const SUBDOMAIN_MAP: Record<string, string> = {
  admin: "/admin",
  owners: "/owners",
  captains: "/captains",
  agents: "/agents",
};

const PREFIX_TO_SUBDOMAIN: Record<string, string> = {
  "/admin": "admin",
  "/owners": "owners",
  "/captains": "captains",
  "/agents": "agents",
};

const PRODUCTION_DOMAIN = "kosyachts.com";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const hostname = req.nextUrl.hostname;
  const isProduction =
    hostname === PRODUCTION_DOMAIN ||
    hostname.endsWith(`.${PRODUCTION_DOMAIN}`);

  // Tracks the logical pathname (may differ from URL if subdomain root is rewritten)
  let effectivePathname = pathname;
  let rewriteTarget: URL | null = null;

  if (isProduction) {
    const subdomain = hostname.split(".")[0];
    const pathPrefix = SUBDOMAIN_MAP[subdomain];

    if (pathPrefix) {
      // Subdomain request — rewrite root "/" to the section page
      if (pathname === "/" || pathname === "") {
        effectivePathname = pathPrefix;
        rewriteTarget = req.nextUrl.clone();
        rewriteTarget.pathname = pathPrefix;
      }
      // Paths like /admin/boats on admin.kosyachts.com pass through unchanged
    } else {
      // Main domain — redirect section paths to their subdomain
      for (const [prefix, sub] of Object.entries(PREFIX_TO_SUBDOMAIN)) {
        if (pathname === prefix || pathname === `${prefix}/`) {
          return NextResponse.redirect(
            new URL(`https://${sub}.${PRODUCTION_DOMAIN}`)
          );
        }
        if (pathname.startsWith(`${prefix}/`)) {
          return NextResponse.redirect(
            new URL(
              `https://${sub}.${PRODUCTION_DOMAIN}${pathname}${req.nextUrl.search}`
            )
          );
        }
      }
    }
  }

  // --- Auth guards (use effectivePathname so rewritten roots are protected) ---
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.isAdmin === true;
  const isOwner = session?.user?.isOwner === true;
  const isCaptain = session?.user?.isCaptain === true;

  if (effectivePathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", effectivePathname);
      return NextResponse.redirect(signInUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  if (effectivePathname.startsWith("/owners")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", effectivePathname);
      return NextResponse.redirect(signInUrl);
    }
    if (!isOwner) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  if (effectivePathname.startsWith("/captains")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", effectivePathname);
      return NextResponse.redirect(signInUrl);
    }
    if (!isCaptain) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  if (effectivePathname.startsWith("/agents")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", effectivePathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (
    effectivePathname.startsWith("/profile") ||
    effectivePathname.startsWith("/bookings")
  ) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", effectivePathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (effectivePathname.startsWith("/api/admin")) {
    if (!isLoggedIn)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    if (!isAdmin)
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
  }

  if (
    effectivePathname.startsWith("/api/users/profile") ||
    effectivePathname.startsWith("/api/users/stats")
  ) {
    if (!isLoggedIn)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
  }

  if (effectivePathname.startsWith("/api/upload")) {
    if (!isLoggedIn)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
  }

  // Apply rewrite for subdomain root, or continue normally
  if (rewriteTarget) {
    return NextResponse.rewrite(rewriteTarget);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/webhook|api/auth|api/boats/[^/]+/availability|api/boats/[^/]+/calendar|api/events|api/users/[^/]+$).*)",
  ],
};
