import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    status: { type: String, default: "pending" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    assignedTo: [{ type: String }], // emails of members
    createdBy: { type: String }, // email or userId
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
