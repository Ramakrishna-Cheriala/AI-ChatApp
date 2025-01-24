import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
