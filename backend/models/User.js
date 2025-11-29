// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    // Global role in platform
    role: {
      type: String,
      enum: ["manager", "member"],
      default: "member",
    },
    // You can use this later for invite-only access
    status: {
      type: String,
      enum: ["active", "invited"],
      default: "active",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
