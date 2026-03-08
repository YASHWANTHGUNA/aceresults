import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  branch: String,
  batch: String,
  passwordHash: String
});

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);