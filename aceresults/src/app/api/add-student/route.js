import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectDB();

  const password = "23AG1A0501";

  const hashedPassword = await bcrypt.hash(password, 10);

  const student = await Student.create({
    rollNumber: "23AG1A0501",
    name: "Rahul",
    branch: "CSE",
    batch: "2023-2027",
    passwordHash: hashedPassword,
  });

  return Response.json({
    message: "Student added successfully",
    student,
  });
}