import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { rollNumber, password } = body;

  const student = await Student.findOne({ rollNumber });

  if (!student) {
    return Response.json({ message: "Student not found" }, { status: 404 });
  }

  const validPassword = await bcrypt.compare(password, student.passwordHash);

  if (!validPassword) {
    return Response.json({ message: "Invalid password" }, { status: 401 });
  }

  return Response.json({
    message: "Login successful",
    student: {
      rollNumber: student.rollNumber,
      name: student.name,
      branch: student.branch,
      batch: student.batch
    }
  });
}