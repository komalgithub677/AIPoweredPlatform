import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, default: "member" }, // Only members can be invited
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Invitation", invitationSchema);
