import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Chat from "./models/chat.model.js";
import { generateResult } from "./services/ai.service.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const chatId = socket.handshake.query.chatId;

    // console.log("chatId: ", chatId);

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return next(new Error("Invalid chat ID"));
    }

    socket.chat = await Chat.findById(chatId);
    // console.log("scoket chatId: ", socket.chat);

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      return next(new Error("Authentication error"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.chat._id.toString();
  console.log("a user connected");
  socket.join(socket.roomId);

  socket.on("chat-message", async (data) => {
    console.log("data: ", data);
    const message = data.content;
    console.log("message: ", message);

    const aiIsPresentInMessage = message.includes("@ai");

    socket.broadcast.to(socket.roomId).emit("chat-message", data);

    if (aiIsPresentInMessage) {
      console.log("ai is responding");
      const prompt = message?.replace("@ai", "");
      const result = await generateResult(
        prompt,
        socket.roomId,
        data.sender._id
      );

      io.to(socket.roomId).emit("chat-message", {
        chat: socket.roomId,
        content: result,
        isAI: true,
        sender: data.sender,
        receiver: null,
        sentAt: new Date(),
      });
    }
  });

  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
