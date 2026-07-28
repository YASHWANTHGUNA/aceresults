// src/app/api/security/not-me/route.js
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

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
  student.loginHistory = [
    { time: new Date(), ip: "n/a", userAgent: "n/a", status: "SECURED" },
    ...student.loginHistory,
  ].slice(0, 20);

  await student.save();

  // Clear cookie immediately on the client side as well
  (await cookies()).delete("student_session");

  // Send security confirmation email
  if (student.email) {
    sendEmail({
      to: student.email,
      subject: "Your ACE Results account has been secured",
      html: `<p>We've logged you out everywhere and required a password reset, as requested. If you didn't do this, contact the academic office immediately.</p>`,
    }).catch(() => {});
  }

  return NextResponse.json({
    message: "Account secured. All sessions revoked, password reset required, temporary lock applied.",
  });
}