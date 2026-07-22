export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
import PDFParser from "pdf2json";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");
    const semester = formData.get("semester") || "II-I"; 

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const extractedText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1); 
      pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
      pdfParser.parseBuffer(buffer);
    });

    const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    const studentsMap = {}; 
    let currentRollNo = null;
    let tempSubjectsBuffer = []; 

    for (let line of lines) {
      const subjectCodeMatch = line.match(/\b([A-Z]{2,3}\d{3}[A-Z0-9]*)\b/);
      const isGradeLine = subjectCodeMatch && (line.includes(".0") || line.includes(".5") || line.includes(" P ") || line.includes(" F ") || line.endsWith("P") || line.endsWith("F"));
      
      let extractedSubject = null;
      if (isGradeLine) {
        extractedSubject = {
          subjectCode: subjectCodeMatch[1],
          rawString: line
        };
      }

      const rollMatch = line.match(/\b\d{2}[A-Z0-9]{8}\b/);
      if (rollMatch) {
        currentRollNo = rollMatch[0];
        
        if (!studentsMap[currentRollNo]) {
          studentsMap[currentRollNo] = {
            rollNumber: currentRollNo,
            semester: semester,
            subjects: [...tempSubjectsBuffer], 
            sgpa: null,
            cgpa: null,
            status: "PASS" 
          };
        }
        tempSubjectsBuffer = []; 

        if (extractedSubject) {
          studentsMap[currentRollNo].subjects.push(extractedSubject);
        }
      } 
      else if (extractedSubject) {
        tempSubjectsBuffer.push(extractedSubject);
      }

      if (currentRollNo && line.includes("SGPA:")) {
        const sgpaMatch = line.match(/SGPA:\s*([\d.]+)/);
        const cgpaMatch = line.match(/CGPA:\s*([\d.]+)/);
        
        if (sgpaMatch) studentsMap[currentRollNo].sgpa = parseFloat(sgpaMatch[1]);
        if (cgpaMatch) studentsMap[currentRollNo].cgpa = parseFloat(cgpaMatch[1]);
        
        const hasFailed = studentsMap[currentRollNo].subjects.some(sub => sub.rawString.includes(" F ") || sub.rawString.includes("F(Ab)") || sub.rawString.endsWith(" F"));
        if (hasFailed) {
            studentsMap[currentRollNo].status = "FAIL";
        }
        
        currentRollNo = null; 
      }
    }

    const finalStudentData = Object.values(studentsMap);

    if (finalStudentData.length === 0) {
        return NextResponse.json({ success: false, message: "No student data extracted." });
    }

    const bulkOps = finalStudentData.map(student => ({
      updateOne: {
        filter: { rollNumber: student.rollNumber, semester: student.semester },
        update: { $set: student },
        upsert: true
      }
    }));

    await Result.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: `T-Sheet Processed! Data for ${finalStudentData.length} students saved to database.`,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}