import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();

  const body = await req.json();

  const { rollNumber, oldPassword, newPassword } = body;

  const student = await Student.findOne({ rollNumber });

  if (!student) {
    return Response.json({ message: "Student not found" });
  }

  // Compare old password with stored hash
  const isMatch = await bcrypt.compare(oldPassword, student.passwordHash);

  if (!isMatch) {
    return Response.json({ message: "Old password incorrect" });
  }

  // Validate new password length
  if (newPassword.length < 6) {
    return Response.json({ message: "Password must be at least 6 characters" });
  }

  // Hash the new password
  const newHash = await bcrypt.hash(newPassword, 10);

  student.passwordHash = newHash;

  await student.save();

  return Response.json({ message: "Password updated successfully" });
}
