// src/app/api/security/not-me/route.js
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  let payload;
  try {
    payload = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    if (payload.purpose !== "not-me") throw new Error("bad purpose");
  } catch {
    return NextResponse.json({ message: "Invalid or expired link" }, { status: 400 });
  }

  await connectDB();
  const student = await Student.findOne({ rollNumber: payload.rollNumber });
  if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

  student.sessionVersion += 1;       // kills every active session immediately
  student.mustChangePassword = true; // forces reset on next login
  student.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // temporary lock
  await student.save();

  return NextResponse.json({
    message: "Account secured. All sessions revoked, password reset required, temporary lock applied.",
  });
}