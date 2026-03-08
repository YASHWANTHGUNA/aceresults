import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  rollNumber: String,
  semester: String,
  subjects: [
    {
      subjectCode: String,
      subjectName: String,
      credits: Number,
      grade: String
    }
  ],
  sgpa: Number,
  cgpa: Number,
  status: String
});

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);