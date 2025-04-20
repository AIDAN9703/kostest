import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';

// This function can be marked `async` if using `await` inside
export default auth(async function middleware(req) {
  const session = await auth();
  const pathname = req.nextUrl.pathname;
  
  // If user is authenticated but trying to access role-specific areas
  if (session) {
    // Admin routes protection
    if (pathname.startsWith('/admin') && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    // Owner-specific routes protection
    if (pathname.startsWith('/owner') && 
        !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    // Captain-specific routes protection
    if (pathname.startsWith('/captain') && 
        !['CAPTAIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    // Payment routes require verified phone
    if (pathname.startsWith('/payments') && !session.user.phoneVerified) {
      return NextResponse.redirect(new URL('/verify', req.url));
    }
  }
  
  // Default behavior handled by Auth.js
  return NextResponse.next();
});

// Define which routes this middleware applies to
export const config = {
  matcher: [
    // Apply to all routes except public ones
    '/((?!api/public|_next/static|_next/image|favicon.ico|sign-in|sign-up|verify|reset-password).*)',
  ],
};