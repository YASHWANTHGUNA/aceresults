// src/models/Feedback.js
import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    screenshotUrl: { type: String, default: "" },
    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED"], default: "OPEN" },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);