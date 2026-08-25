import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth/jwt";

// Which route prefixes require which roles. Checked top-down; first match wins.
const PROTECTED_PREFIXES: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/faculty", roles: ["faculty", "admin"] },
  { prefix: "/dashboard", roles: ["student", "faculty", "admin"] },
];

async function verify(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The admin login form itself must stay reachable while logged out, or
  // redirecting an unauthenticated /admin visitor here would just loop.
  if (pathname === "/admin/login") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const payload = token ? await verify(token) : null;
    if (payload?.role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  const match = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p.prefix));
  if (!match) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verify(token) : null;

  if (!payload) {
    const loginPath = match.prefix === "/admin" ? "/admin/login" : "/login";
    const loginUrl = new URL(loginPath, req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!payload.role || !match.roles.includes(payload.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/faculty/:path*"],
};
