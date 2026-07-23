import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { email, password, department } = await req.json();

    if (!email || !password || !department) {
      return NextResponse.json(
        { success: false, message: "Email, password, and department are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hod = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "HOD",
      department: department.trim().toUpperCase(),
    });

    return NextResponse.json({
      success: true,
      message: `HOD account created for ${normalizedEmail} (${hod.department}).`,
      hod: { email: hod.email, department: hod.department },
    });
  } catch (error) {
    console.error("Create HOD Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// same file, add below POST
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const hods = await User.find({ role: "HOD" }, { password: 0 }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, hods });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}