import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Middleware for authentication and authorization
 * Protects admin routes, profile routes, booking routes, and admin API routes
 * 
 * Note: auth() wrapper provides req.auth automatically
 * No need to call auth() again inside the function
 */
export default auth((req) => {
  const session = req.auth; // Already available from auth() wrapper
  const { pathname } = req.nextUrl;
  
  // Helper flags for cleaner logic
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  
  // 1. Protect admin routes - require authentication + ADMIN role
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
  
  // 2. Protect profile routes - require authentication only
  if (pathname.startsWith("/profile")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // 3. Protect booking routes - require authentication
  if (pathname.startsWith("/bookings")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // 4. Protect admin API routes - require ADMIN role
  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
  }
  
  // 5. Protect user-specific API routes - require authentication
  if (pathname.startsWith("/api/users/profile") || pathname.startsWith("/api/users/stats")) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  }
  
  // 6. Protect upload API - require authentication
  if (pathname.startsWith("/api/upload")) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  }
  
  // All checks passed
  return NextResponse.next();
});

/**
 * Matcher configuration - runs middleware only on these routes
 * 
 * Recommended Next.js matcher pattern:
 * - Include all protected routes
 * - Exclude static files (_next/static, _next/image, favicon.ico)
 * - Exclude public API routes that don't need auth
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (public files)
     * - Public API routes (webhooks, public data)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/webhook|api/auth|api/boats/[^/]+/availability|api/boats/[^/]+/calendar|api/events|api/users/[^/]+$).*)",
    
    // Explicitly include protected routes for clarity
    "/admin/:path*",
    "/profile/:path*",
    "/bookings/:path*",
    "/api/admin/:path*",
    "/api/users/profile/:path*",
    "/api/users/stats/:path*",
    "/api/upload/:path*",
  ],
};