// src/lib/studentAuth.js
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getStudentSession() {
  const token = (await cookies()).get("student_session")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET);
  } catch {
    return null;
  }
}