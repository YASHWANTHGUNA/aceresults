// src/models/Result.js
import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    grade: { type: String, required: true },
    status: { type: String, enum: ["P", "F"], required: true },
    credits: { type: Number, required: true },
  },
  { _id: false }
);

const ResultSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, uppercase: true, index: true },
    semester: { type: String, required: true },
    subjects: [SubjectSchema],
    sgpa: { type: Number, default: null },
    cgpa: { type: Number, default: null },
    status: { type: String, enum: ["PASS", "FAIL"], required: true },
  },
  { timestamps: true }
);

ResultSchema.index({ rollNumber: 1, semester: 1 }, { unique: true });

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);