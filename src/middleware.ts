import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "session";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    !path.startsWith("/dashboard") &&
    !path.startsWith("/departments") &&
    !path.startsWith("/jobs") &&
    !path.startsWith("/blueprints")
  ) {
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
  if (path.startsWith("/departments") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (path.startsWith("/jobs") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (path.startsWith("/blueprints") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/departments",
    "/departments/:path*",
    "/jobs",
    "/jobs/:path*",
    "/blueprints",
    "/blueprints/:path*",
  ],
};
