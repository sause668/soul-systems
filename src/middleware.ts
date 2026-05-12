import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "session";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/worker") && !path.startsWith("/admin") && !path.startsWith("/departments")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const verified = await jwtVerify(token, new TextEncoder().encode(secret)).catch(() => null);
  if (!verified) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = verified.payload.userRole;
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/worker", request.url));
  }

  if (path.startsWith("/departments") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/worker", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/worker/:path*", "/admin/:path*", "/departments", "/departments/:path*"],
};
