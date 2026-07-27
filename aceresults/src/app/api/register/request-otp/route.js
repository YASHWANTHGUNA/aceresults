import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import PendingRegistration from "@/models/PendingRegistration";
import bcrypt from "bcryptjs";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendEmail, otpEmailHtml } from "@/lib/email";
import { ACE_ROLL_RE, deriveBatch } from "@/lib/rollNumber";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

export async function POST(req) {
  await connectDB();

  const {
    rollNumber: rawRoll,
    firstName,
    lastName,
    department,
    email: rawEmail,
    mobile: rawMobile,
    password,
    confirmPassword,
  } = await req.json();

  const rollNumber = (rawRoll || "").trim().toUpperCase();
  const email = (rawEmail || "").trim().toLowerCase();
  const mobile = (rawMobile || "").replace(/\D/g, "");

  // --- validation ---
  if (!ACE_ROLL_RE.test(rollNumber)) {
    return Response.json(
      { message: "Invalid Roll Number format. Expected e.g. 23AG1A0521" },
      { status: 400 }
    );
  }
  if (!firstName?.trim() || !lastName?.trim()) {
    return Response.json({ message: "First name and last name are required" }, { status: 400 });
  }
  if (!department?.trim()) {
    return Response.json({ message: "Department is required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ message: "Invalid email address" }, { status: 400 });
  }
  if (!MOBILE_RE.test(mobile)) {
    return Response.json({ message: "Invalid mobile number" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return Response.json({ message: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return Response.json({ message: "Passwords do not match" }, { status: 400 });
  }

  // --- duplicate check ---
  const existing = await Student.findOne({ rollNumber });
  if (existing) {
    return Response.json(
      { message: "An account already exists for this Roll Number. Try logging in instead." },
      { status: 409 }
    );
  }

  const { batch } = deriveBatch(rollNumber);
  const fullName = `${firstName.trim()} ${lastName.trim()}`;

  // --- create/replace pending registration ---
  await PendingRegistration.deleteMany({ rollNumber });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const passwordHash = await bcrypt.hash(password, 10);

  await PendingRegistration.create({
    rollNumber,
    name: fullName,
    department: department.trim().toUpperCase(),
    email,
    mobile,
    passwordHash,
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "Verify your ACE Results Portal registration",
    html: otpEmailHtml(otp),
  });

  const masked = email.replace(/(.{2}).+(@.+)/, "$1***$2");
  return Response.json({ message: `OTP sent to ${masked}`, batch });
}