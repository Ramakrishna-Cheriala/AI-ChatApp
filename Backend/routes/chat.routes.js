import { Router } from "express";
import { body } from "express-validator";
import * as chatController from "../controllers/chat.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware.authUser, chatController.createChat);

router.post(
  "/send-message/:receiverId",
  authMiddleware.authUser,
  chatController.sendMessage
);

router.post(
  "/send-group-message/:chatId",
  authMiddleware.authUser,
  chatController.sendGroupMessage
);

router.get(
  "/messages/:id",
  authMiddleware.authUser,
  chatController.getMessages
);

router.get("/", authMiddleware.authUser, chatController.getAllChats);

router.get("/:id", authMiddleware.authUser, chatController.getChatById);

router.put(
  "/add-user/:id",
  authMiddleware.authUser,
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  chatController.addUserToGroupChat
);

router.post(
  "/create-group",
  authMiddleware.authUser,
  chatController.createGroupChat
);

export default router;
