// src/lib/otp.js
import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}