import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;
  console.log(`Middlewa re triggered for path: ${pathname}`);

  // Allow access to public routes without a token
  const publicRoutes = ["/login", "/register", "/"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

   const token = request.cookies.get("access_token")?.value;

  // Redirect to login if no token is present
  if (!token) {
    console.log("No token found, redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token
  try {
    jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully");
    return NextResponse.next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "session_expired");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/documents/:path*", "/profile/:path*", "/dashboard/:path*"], // Added /dashboard
};