// src/app/api/feedback/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import { getStudentSession } from "@/lib/studentAuth";

export async function POST(req) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const description = (formData.get("description") || "").toString().trim();
    const screenshot = formData.get("screenshot");

    if (!description) {
      return NextResponse.json({ success: false, message: "Description is required" }, { status: 400 });
    }

    let screenshotUrl = "";
    if (screenshot && typeof screenshot === "object" && screenshot.size > 0) {
      if (screenshot.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, message: "Screenshot must be under 5MB" }, { status: 400 });
      }
      const buffer = Buffer.from(await screenshot.arrayBuffer());
      screenshotUrl = `data:${screenshot.type};base64,${buffer.toString("base64")}`;
    }

    const feedback = await Feedback.create({
      rollNumber: session.rollNumber,
      description,
      screenshotUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully. Thank you!",
      id: feedback._id,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Optional: let the student/HOD view feedback later if needed
export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    await connectDB();
    const items = await Feedback.find({ rollNumber: session.rollNumber }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}