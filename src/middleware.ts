import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin", "/profile", "/settings", "/upload", "/files"];

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/public-files", "/about", "/contact"];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || (route === "/" && pathname === "/"));

  // Handle API routes separately
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute) {
    // Check for authentication token/data in cookies or headers
    const authCookie = request.cookies.get("auth-storage");
    const hasAuthData = authCookie?.value;

    // Parse the auth data to check if user is authenticated
    let isAuthenticated = false;
    if (hasAuthData) {
      try {
        const authData = JSON.parse(hasAuthData);
        isAuthenticated = authData?.state?.isAuthenticated === true && authData?.state?.user;
      } catch (error) {
        // Invalid auth data, treat as unauthenticated
        isAuthenticated = false;
      }
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For public routes or authenticated users on protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public|assets).*)",
  ],
};
