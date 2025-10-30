import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: { type: String },
    members: [{ name: String, email: String, role: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
