// src/app/api/student/me/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { getStudentSession } from "@/lib/studentAuth";

export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const student = await Student.findOne(
    { rollNumber: session.rollNumber },
    { passwordHash: 0 }
  );

  if (!student) {
    return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, student });
}