import mongoose from "mongoose";

const PendingRegistrationSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, uppercase: true, index: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    mobile: { type: String, required: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

PendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PendingRegistration ||
  mongoose.model("PendingRegistration", PendingRegistrationSchema);