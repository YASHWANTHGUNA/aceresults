import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["ADMIN", "HOD"], // Strict RBAC enforcement
    },
    department: {
      type: String,
      required: false, // E.g., "CSM", "CSE". Only needed for HODs.
    }
  },
  { timestamps: true }
);

// Prevent Mongoose from recompiling the model upon hot-reloads
export default mongoose.models.User || mongoose.model("User", UserSchema);