// src/models/Student.js
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, default: "" },
    department: { type: String, default: "" },
    section: { type: String, default: "" },
    batch: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    mobile: { type: String, default: "" },
    passwordHash: String,
    mustChangePassword: { type: Boolean, default: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    createdBy: { type: String, default: "" },
    role: { type: String, enum: ["STUDENT", "HOD", "ADMIN"], default: "STUDENT" },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);