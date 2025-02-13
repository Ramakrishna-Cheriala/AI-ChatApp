import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import "dotenv/config";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connect();

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

export default app;
