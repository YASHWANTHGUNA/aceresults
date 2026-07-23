// scripts/seed-admin.mjs
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  department: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Check .env.local exists and has the variable.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const hash = await bcrypt.hash("changeme-immediately", 10);
  await User.create({ email: "admin@aceec.ac.in", password: hash, role: "ADMIN" });

  console.log("Admin created. LOG IN AND CHANGE THIS PASSWORD IMMEDIATELY.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});