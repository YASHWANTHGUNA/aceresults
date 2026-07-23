// src/app/api/upload/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { parseTsheetBuffer } from "@/lib/parseTsheet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOD") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");
    const semester = formData.get("semester");
    const branch = formData.get("branch") || session.user.department || "UNKNOWN";
    const batch = formData.get("batch") || "";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }
    if (!semester) {
      return NextResponse.json({ success: false, error: "Semester is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { validStudents, rejected, parserErrors } = await parseTsheetBuffer(buffer);

    if (validStudents.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid student records extracted.",
        rejected,
        parserErrors,
      });
    }

    // 1. Upsert Results
    const resultBulkOps = validStudents.map((student) => ({
      updateOne: {
        filter: { rollNumber: student.rollNumber, semester },
        update: {
          $set: {
            rollNumber: student.rollNumber,
            semester,
            subjects: student.subjects,
            sgpa: student.sgpa,
            cgpa: student.cgpa,
            status: student.status,
          },
        },
        upsert: true,
      },
    }));
    const resultWrite = await Result.bulkWrite(resultBulkOps);

    // 2. Upsert Students — only create if they don't already exist.
    // Default password = roll number; student is forced to change it via /change-password.
    const existing = await Student.find(
      { rollNumber: { $in: validStudents.map((s) => s.rollNumber) } },
      { rollNumber: 1 }
    );
    const existingRolls = new Set(existing.map((s) => s.rollNumber));
    const newStudents = validStudents.filter((s) => !existingRolls.has(s.rollNumber));

    if (newStudents.length > 0) {
      const studentDocs = await Promise.all(
        newStudents.map(async (s) => ({
          rollNumber: s.rollNumber,
          name: "", // HOD/Admin can fill this in later via a separate roster upload if you want
          branch,
          batch,
          passwordHash: await bcrypt.hash(s.rollNumber, 10),
          role: "STUDENT",
          mustChangePassword: true,
        }))
      );
      await Student.insertMany(studentDocs, { ordered: false });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${validStudents.length} student record(s). ${resultWrite.upsertedCount} new, ${resultWrite.modifiedCount} updated. ${newStudents.length} new student account(s) created.`,
      rejectedCount: rejected.length,
      rejected,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}