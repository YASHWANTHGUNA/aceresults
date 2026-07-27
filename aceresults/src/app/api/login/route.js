// src/app/api/login/route.js
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sendEmail, loginAlertHtml } from "@/lib/email";

export async function POST(req) {
  await connectDB();
  const { rollNumber, password } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const student = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
  if (!student) {
    return Response.json({ message: "Student not found" }, { status: 404 });
  }

  if (student.accountLockedUntil && student.accountLockedUntil > new Date()) {
    return Response.json({ message: "Account temporarily locked. Try again later." }, { status: 423 });
  }

  const validPassword = await bcrypt.compare(password, student.passwordHash);
  if (!validPassword) {
    student.failedLoginAttempts += 1;
    if (student.failedLoginAttempts >= 5) {
      student.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await student.save();
    return Response.json({ message: "Invalid password" }, { status: 401 });
  }

  student.failedLoginAttempts = 0;
  student.accountLockedUntil = null;
  student.lastLogin = new Date();
  student.lastLoginIP = ip;
  await student.save();

  const token = jwt.sign(
    {
      rollNumber: student.rollNumber,
      role: "STUDENT",
      sessionVersion: student.sessionVersion, // <-- baked in at login
    },
    process.env.NEXTAUTH_SECRET,
    { expiresIn: "12h" }
  );

  (await cookies()).set("student_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  // fire-and-forget — never block login on email delivery
  if (student.email && student.emailVerified) {
    const notMeToken = jwt.sign(
      { rollNumber: student.rollNumber, purpose: "not-me" },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "24h" }
    );
    const notMeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/security/not-me?token=${notMeToken}`;

    sendEmail({
      to: student.email,
      subject: "New login to your account",
      html: loginAlertHtml({
        rollNumber: student.rollNumber,
        ip,
        time: new Date().toLocaleString(),
        notMeUrl,
      }),
    }).catch((err) => console.error("Login alert email failed:", err));
  }

  return Response.json({
    message: "Login successful",
    student: {
      rollNumber: student.rollNumber,
      name: student.name,
      branch: student.branch,
      batch: student.batch,
      mustChangePassword: student.mustChangePassword,
    },
  });
}