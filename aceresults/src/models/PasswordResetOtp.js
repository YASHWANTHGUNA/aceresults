// src/models/PasswordResetOtp.js
import mongoose from "mongoose";

const PasswordResetOtpSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, uppercase: true, index: true },
    otpHash: { type: String, required: true },
    pendingPasswordHash: { type: String, required: true }, // hashed NEW password, not yet committed
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// auto-delete expired docs
PasswordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordResetOtp ||
  mongoose.model("PasswordResetOtp", PasswordResetOtpSchema);