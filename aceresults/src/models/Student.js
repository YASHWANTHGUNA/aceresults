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
    emailVerified: { type: Boolean, default: false },
    passwordHash: String,
    mustChangePassword: { type: Boolean, default: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    createdBy: { type: String, default: "" },
    role: { type: String, enum: ["STUDENT", "HOD", "ADMIN"], default: "STUDENT" },

    // security additions
    sessionVersion: { type: Number, default: 0 },       // bump = revoke all sessions
    lastPasswordChanged: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    lastLoginIP: { type: String, default: "" },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);