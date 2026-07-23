// src/app/api/login/route.js
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
  await connectDB();
  const { rollNumber, password } = await req.json();

  const student = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
  if (!student) {
    return Response.json({ message: "Student not found" }, { status: 404 });
  }

  const validPassword = await bcrypt.compare(password, student.passwordHash);
  if (!validPassword) {
    return Response.json({ message: "Invalid password" }, { status: 401 });
  }

  const token = jwt.sign(
    { rollNumber: student.rollNumber, role: "STUDENT" },
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