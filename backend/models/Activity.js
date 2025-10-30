import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  timestamp: { type: Date, default: Date.now },
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
