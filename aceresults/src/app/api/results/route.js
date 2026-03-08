import { connectDB } from "@/lib/db";
import Result from "@/models/Result";

export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { rollNumber, semester } = body;
  console.log("Incoming data:", rollNumber, semester);

  const result = await Result.findOne({
    rollNumber: "23AG1A0501",
    //semester: semester
  });
  console.log("Result from DB:", result);

  if (!result) {
    return Response.json(
      { message: "Result not found" },
      { status: 404 }
    );
  }

  return Response.json(result);
}