import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatType: {
    type: String,
    enum: ["private", "group"],
    required: true,
  },
  chatName: {
    type: String,
    required: function () {
      return this.chatType === "group";
    },
    trim: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
