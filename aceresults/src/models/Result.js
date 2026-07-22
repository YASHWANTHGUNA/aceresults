import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  semester: { type: String, required: true },
  sgpa: { type: Number },
  cgpa: { type: Number },
  status: { type: String },
  subjects: [
    {
      subjectCode: { type: String },
      rawString: { type: String } // <--- MUST BE EXACTLY THIS
    }
  ]
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);