import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import PendingRegistration from "@/models/PendingRegistration";
import { verifyOtp } from "@/lib/otp";
import { deriveBatch } from "@/lib/rollNumber";

const MAX_ATTEMPTS = 5;

export async function POST(req) {
  await connectDB();
  const { rollNumber: rawRoll, otp } = await req.json();
  const rollNumber = (rawRoll || "").trim().toUpperCase();

  if (!rollNumber || !otp) {
    return Response.json({ message: "Roll number and OTP are required" }, { status: 400 });
  }

  const record = await PendingRegistration.findOne({ rollNumber });
  if (!record) {
    return Response.json({ message: "No pending registration. Please start again." }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    return Response.json({ message: "OTP expired. Please register again." }, { status: 400 });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    return Response.json({ message: "Too many attempts. Please register again." }, { status: 429 });
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

  // double-check no race-condition duplicate got created meanwhile
  const existing = await Student.findOne({ rollNumber });
  if (existing) {
    await record.deleteOne();
    return Response.json({ message: "Account already exists. Please log in." }, { status: 409 });
  }

  const { batch } = deriveBatch(rollNumber);

  await Student.create({
    rollNumber,
    name: record.name,
    department: record.department,
    batch,
    email: record.email,
    emailVerified: true,
    passwordHash: record.passwordHash,
    mustChangePassword: false,
    status: "ACTIVE",
    role: "STUDENT",
    createdBy: "self-registration",
  });

  await record.deleteOne();

  return Response.json({ message: "Registration successful. Please log in." });
}