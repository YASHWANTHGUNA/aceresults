import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();

  const { rollNumber, password } = await req.json();

  const student = await Student.findOne({ rollNumber });

  if (!student) {
    return Response.json(
      { message: "Student not found" },
      { status: 404 }
    );
  }

  const isMatch = await bcrypt.compare(password, student.passwordHash);

  if (!isMatch) {
    return Response.json(
      { message: "Invalid password" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    { rollNumber: student.rollNumber },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return Response.json({
    message: "Login successful",
    token
  });
}