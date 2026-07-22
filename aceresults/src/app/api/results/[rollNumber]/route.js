import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/models/Result"; 

export async function GET(req, { params }) {
  try {
    await connectDB();

    // Grab the roll number from the URL (e.g., 22AG5A6602)
    const { rollNumber } = await params;
    
    // We force it to uppercase just in case the student types it in lowercase
    const formattedRollNumber = rollNumber.toUpperCase();

    // Query the database for this specific student
    // We sort by semester so the latest results show up first
    const studentResults = await Result.find({ rollNumber: formattedRollNumber }).sort({ semester: -1 });

    if (!studentResults || studentResults.length === 0) {
      return NextResponse.json(
        { success: false, message: "No results found for this Roll Number." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: studentResults
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function DELETE(req, context) {
  try {
    await connectDB();

    const params = await context.params;
    const rawRollNumber = params.rollNumber || params.rollnumber || params.id || params.RollNumber;

    if (!rawRollNumber) {
      return NextResponse.json(
        { success: false, message: "Roll Number parameter is missing." },
        { status: 400 }
      );
    }

    const formattedRollNumber = String(rawRollNumber).toUpperCase();

    // Use deleteMany just in case our previous tests accidentally made duplicates
    const deleteResult = await Result.deleteMany({ rollNumber: formattedRollNumber });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: `No records found in database for ${formattedRollNumber}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} record(s) for ${formattedRollNumber}.`
    });

  } catch (error) {
    console.error("Backend Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}