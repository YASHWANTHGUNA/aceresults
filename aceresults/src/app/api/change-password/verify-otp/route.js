// src/app/api/change-password/verify-otp/route.js
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import PasswordResetOtp from "@/models/PasswordResetOtp";
import { verifyOtp } from "@/lib/otp";
import { sendEmail, passwordChangedHtml } from "@/lib/email";
import { getStudentSession } from "@/lib/studentAuth";

const MAX_ATTEMPTS = 5;

export async function POST(req) {
  const session = await getStudentSession();
  if (!session) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const { otp } = await req.json();
  if (!otp) {
    return Response.json({ message: "OTP required" }, { status: 400 });
  }

  const record = await PasswordResetOtp.findOne({ rollNumber: session.rollNumber });
  if (!record) {
    return Response.json({ message: "No pending request. Please start again." }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    return Response.json({ message: "OTP expired. Please request a new one." }, { status: 400 });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    return Response.json({ message: "Too many attempts. Please request a new OTP." }, { status: 429 });
  }

  const valid = await verifyOtp(otp, record.otpHash);
  if (!valid) {
    record.attempts += 1;
    await record.save();
    return Response.json(
      { message: `Incorrect OTP (${MAX_ATTEMPTS - record.attempts} attempts left)` },
      { status: 400 }
    );
  }

  // OTP correct — only now do we touch the real password
  const student = await Student.findOne({ rollNumber: session.rollNumber });
  student.passwordHash = record.pendingPasswordHash;
  student.mustChangePassword = false;
  student.lastPasswordChanged = new Date();
  student.sessionVersion += 1; // kill every existing session, including this one
  await student.save();

  await record.deleteOne();

  if (student.email) {
    await sendEmail({
      to: student.email,
      subject: "Your password was changed",
      html: passwordChangedHtml(),
    });
  }

  return Response.json({ message: "Password updated successfully. Please log in again." });
}