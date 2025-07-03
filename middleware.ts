import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";

// ⚠️ NOTE: Using auth() in middleware creates serverless functions
// This is fine for low traffic, but consider withAuth for high traffic
export default auth(async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;
  
  // Protect admin routes - only allow ADMIN users
  if (pathname.startsWith("/admin")) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/profile")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  
  // All other protected routes are handled by auth() above
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"]
};