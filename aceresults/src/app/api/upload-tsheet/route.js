// import { NextResponse } from 'next/server';
// import { GoogleGenAI, Type } from '@google/genai';

// // Initialize the SDK with your secure API key
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// // Define the exact JSON schema Mongoose expects for a student record
// const studentSchema = {
//     type: Type.OBJECT,
//     properties: {
//         rollNumber: { type: Type.STRING, description: "The unique hall ticket number of the student, e.g., 23AG1A6601" },
//         semester: { type: Type.STRING, description: "The course semester, e.g., I-I" },
//         sgpa: { type: Type.STRING, description: "The Semester Grade Point Average, or 'null' if not available" },
//         cgpa: { type: Type.STRING, description: "The Cumulative Grade Point Average, or 'null' if not available" },
//         status: { type: Type.STRING, description: "Overall exam status, e.g., PASS or FAIL" },
//         subjects: {
//             type: Type.ARRAY,
//             items: {
//                 type: Type.OBJECT,
//                 properties: {
//                     code: { type: Type.STRING, description: "The subject code, e.g., 22MA101BS" },
//                     name: { type: Type.STRING, description: "Full name of the subject" },
//                     grade: { type: Type.STRING, description: "Letter grade received, e.g., F, B, A+" },
//                     status: { type: Type.STRING, description: "Subject status, e.g., P or F" },
//                     credits: { type: Type.NUMBER, description: "Credits awarded for this subject, e.g., 4.0 or 0.0" }
//                 },
//                 required: ["code", "name", "grade", "status", "credits"]
//             },
//             description: "List of all granular subjects evaluated for this student"
//         }
//     },
//     required: ["rollNumber", "semester", "sgpa", "cgpa", "status", "subjects"]
// };

// // Main schema wrapper to process multiple students simultaneously from the document
// const bulkExtractionSchema = {
//     type: Type.OBJECT,
//     properties: {
//         students: {
//             type: Type.ARRAY,
//             items: studentSchema
//         }
//     },
//     required: ["students"]
// };

// export async function POST(request) {
//     try {
//         const formData = await request.formData();
//         const file = formData.get('file');

//         if (!file) {
//             return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//         }

//         // Convert the uploaded file into a base64 buffer for the API call
//         const bytes = await file.arrayBuffer();
//         const buffer = Buffer.from(bytes);

//         console.log("Passing flattened PDF to Gemini Multimodal Extraction Engine...");

//         // Invoke the model using the strict JSON response schema
//         const response = await ai.models.generateContent({
//             model: 'gemini-3.5-flash', 
//             contents: [
//                 {
//                     inlineData: {
//                         data: buffer.toString("base64"),
//                         mimeType: "application/pdf"
//                     }
//                 },
//                 "Extract all student exam records from this academic T-Sheet. Handle text extraction visually to maintain horizontal row alignments accurately. If a field or subject data is blank, output null."
//             ],
//             config: {
//                 responseMimeType: "application/json",
//                 responseSchema: bulkExtractionSchema,
//                 temperature: 0.1 // Kept low for strict, predictable data extraction
//             }
//         });

//         // Parse the strictly typed response from the AI
//         const extractedData = JSON.parse(response.text);
        
//         console.log(`Successfully parsed ${extractedData.students.length} student records from document!`);

//         /* 
//            TODO NEXT: Loop over extractedData.students and save directly 
//            to MongoDB using your existing Mongoose Model:
//            await StudentResult.insertMany(extractedData.students);
//         */

//         return NextResponse.json({ success: true, data: extractedData.students });

//     } catch (error) {
//         console.error("AI Ingestion Pipeline Error:", error);
//         return NextResponse.json({ error: "Processing failed", details: error.message }, { status: 500 });
//     }
// }