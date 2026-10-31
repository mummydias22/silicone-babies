import { NextRequest, NextResponse } from "next/server";

// Fast guard only; requireAdmin() does the real check. Accept both http and https cookie names.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const has = req.cookies.has("better-auth.session_token") || req.cookies.has("__Secure-better-auth.session_token");
    if (!has) return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
