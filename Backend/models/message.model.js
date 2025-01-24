import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isAI: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.post("save", async function (doc, next) {
  try {
    await doc.populate("sender", "username email", "user");
    next();
  } catch (error) {
    next(error);
  }
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
