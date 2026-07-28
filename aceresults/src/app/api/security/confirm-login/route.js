import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  let payload;
  try {
    payload = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    if (payload.purpose !== "confirm-login") throw new Error("bad purpose");
  } catch {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
        <h2>This link is invalid or has expired.</h2>
        <p>No action was taken. If you're concerned about your account, log in and change your password from your dashboard.</p>
      </body></html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  await connectDB();
  const student = await Student.findOne({ rollNumber: payload.rollNumber });
  if (!student) {
    return new NextResponse("Student not found", { status: 404 });
  }

  // Non-destructive: just record that the user explicitly confirmed this login.
  // We update the most recent SUCCESS entry rather than inserting a new row,
  // so the history stays a clean one-entry-per-login-event log.
  if (student.loginHistory?.[0]?.status === "SUCCESS") {
    student.loginHistory[0].status = "CONFIRMED";
  }
  await student.save();

  return new NextResponse(
    `<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
      <h2>Thanks Darling this login has been confirmed as you.</h2>
      <p>No further action is needed. You can close this tab.</p>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}