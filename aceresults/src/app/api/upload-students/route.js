// src/app/api/upload-students/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { parseStudentCSV } from "@/lib/parseStudentCSV";
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
    if (!file) {
      return NextResponse.json({ success: false, message: "No CSV uploaded" }, { status: 400 });
    }

    const csvText = await file.text();
    const { validRows, invalidRows, duplicateRollNumbers, parseErrors } = parseStudentCSV(csvText);

    if (parseErrors.length) {
      return NextResponse.json({ success: false, message: parseErrors[0], parseErrors }, { status: 400 });
    }

    if (validRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid student rows found in the CSV.",
        invalidRows,
      });
    }

    // Check which roll numbers already exist, to distinguish "added" vs "updated"
    const existing = await Student.find(
      { rollNumber: { $in: validRows.map((r) => r.rollNumber) } },
      { rollNumber: 1 }
    );
    const existingRolls = new Set(existing.map((s) => s.rollNumber));

    const department = session.user.department || "UNKNOWN";
    const createdBy = session.user.email || "HOD";

    const bulkOps = await Promise.all(
      validRows.map(async (row) => {
        const isNew = !existingRolls.has(row.rollNumber);
        const setFields = {
          rollNumber: row.rollNumber,
          name: row.name,
          department: row.department || department,
          section: row.section,
          batch: row.batch,
          email: row.email,
          mobile: row.mobile,
        };

        if (isNew) {
          setFields.passwordHash = await bcrypt.hash(row.rollNumber, 10);
          setFields.mustChangePassword = true;
          setFields.status = "ACTIVE";
          setFields.createdBy = createdBy;
          setFields.role = "STUDENT";
        }

        return {
          updateOne: {
            filter: { rollNumber: row.rollNumber },
            update: { $set: setFields },
            upsert: true,
          },
        };
      })
    );

    const result = await Student.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: `Import complete: ${result.upsertedCount} added, ${result.modifiedCount} updated.`,
      summary: {
        totalRows: validRows.length + invalidRows.length,
        added: result.upsertedCount,
        updated: result.modifiedCount,
        duplicates: duplicateRollNumbers.length,
        invalid: invalidRows.length,
      },
      invalidRows,
    });
  } catch (error) {
    console.error("Student CSV Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// same file, add below POST
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOD") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const department = session.user.department;
    const total = await Student.countDocuments({ department, role: "STUDENT" });
    const recent = await Student.find({ department, role: "STUDENT" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("rollNumber name email mobile section status updatedAt");

    return NextResponse.json({ success: true, total, recent });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}