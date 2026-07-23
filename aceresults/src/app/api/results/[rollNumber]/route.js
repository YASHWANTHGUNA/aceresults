// src/app/api/results/[rollNumber]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
import { getStudentSession } from "@/lib/studentAuth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { rollNumber } = await params;
    const formatted = rollNumber.toUpperCase();

    // Allow: (a) the student themselves, or (b) an ADMIN/HOD session
    const studentSession = await getStudentSession();
    const staffSession = await getServerSession(authOptions);

    const isOwner = studentSession && studentSession.rollNumber === formatted;
    const isStaff = staffSession && (staffSession.user.role === "ADMIN" || staffSession.user.role === "HOD");

    if (!isOwner && !isStaff) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const studentResults = await Result.find({ rollNumber: formatted }).sort({ semester: -1 });

    if (!studentResults.length) {
      return NextResponse.json({ success: false, message: "No results found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: studentResults });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}