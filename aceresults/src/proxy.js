// src/proxy.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/studentAuth";

// export const runtime = "nodejs";

export async function proxy(req) {
  const path = req.nextUrl.pathname;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const studentSession = await getStudentSession();

  if (token && (path === "/" || path === "/login")) {
    if (token.role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (token.role === "HOD") return NextResponse.redirect(new URL("/hod/dashboard", req.url));
  }

  if (path.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/hod")) {
    if (!token || token.role !== "HOD") return NextResponse.redirect(new URL("/login", req.url));
  }

  const studentProtected = ["/dashboard", "/results", "/feedback"];
  if (studentProtected.some((p) => path.startsWith(p))) {
    if (!studentSession) return NextResponse.redirect(new URL("/student-login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/hod/:path*", "/dashboard/:path*", "/results/:path*", "/feedback/:path*"],
};