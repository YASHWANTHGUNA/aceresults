import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// CHANGED: We removed the 'default' keyword. 
// Next.js 16 strictly looks for a named export called 'proxy'
export async function proxy(req) {
  const path = req.nextUrl.pathname;
  
  // 1. Securely fetch the token (badge) from the user's browser
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 2. The Auto-Router (If they are already logged in)
  if (token && (path === "/" || path === "/login")) {
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (token.role === "HOD") {
      return NextResponse.redirect(new URL("/hod/dashboard", req.url));
    }
  }

  // 3. The Admin Vault Protection
  if (path.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 4. The HOD Vault Protection
  if (path.startsWith("/hod")) {
    if (!token || token.role !== "HOD") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 5. The Public Lobby
  return NextResponse.next();
}

// 6. The Matcher
export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/hod/:path*"],
};