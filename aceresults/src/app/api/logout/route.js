// src/app/api/logout/route.js
import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("student_session");
  return Response.json({ success: true });
}