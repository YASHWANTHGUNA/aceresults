// src/app/api/change-password/request-otp/route.js — use DB email, not form input
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import PasswordResetOtp from "@/models/PasswordResetOtp";
import bcrypt from "bcryptjs";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendEmail, otpEmailHtml } from "@/lib/email";
import { getStudentSession } from "@/lib/studentAuth";

export async function POST(req) {
  const session = await getStudentSession();
  if (!session) return Response.json({ message: "Not authenticated" }, { status: 401 });

  await connectDB();
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return Response.json({ message: "All fields are required" }, { status: 400 });
  }

  const student = await Student.findOne({ rollNumber: session.rollNumber });
  if (!student) return Response.json({ message: "Student not found" }, { status: 404 });

  const validCurrent = await bcrypt.compare(currentPassword, student.passwordHash);
  if (!validCurrent) {
    return Response.json({ message: "Current password is incorrect" }, { status: 400 });
  }

  if (!student.email) {
    return Response.json(
      { message: "No email on file. Contact the academic office to update your records." },
      { status: 400 }
    );
  }

  await PasswordResetOtp.deleteMany({ rollNumber: student.rollNumber });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const pendingPasswordHash = await bcrypt.hash(newPassword, 10);

  await PasswordResetOtp.create({
    rollNumber: student.rollNumber,
    otpHash,
    pendingPasswordHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: student.email, // ← trusted, from DB, uploaded by HOD via CSV
    subject: "Your password change verification code",
    html: otpEmailHtml(otp),
  });

  // don't leak the full email in the response — mask it
  const masked = student.email.replace(/(.{2}).+(@.+)/, "$1***$2");
  return Response.json({ message: `OTP sent to ${masked}` });
}