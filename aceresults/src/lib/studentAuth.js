// src/lib/studentAuth.js
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function getStudentSession() {
  const token = (await cookies()).get("student_session")?.value;
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, process.env.NEXTAUTH_SECRET);
  } catch {
    return null;
  }

  // check the token's sessionVersion still matches the DB — this is what makes revoke instant
  await connectDB();
  const student = await Student.findOne({ rollNumber: payload.rollNumber }, { sessionVersion: 1 });
  if (!student || student.sessionVersion !== payload.sessionVersion) return null;

  return payload;
}