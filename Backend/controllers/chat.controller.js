import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import * as chatServices from "../services/chat.service.js";
import { validationResult } from "express-validator";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const logedInUser = await User.findOne({ email: req.user.email });
    const { message } = req.body;
    const receiverId = req.params.receiverId;

    const newMessage = await chatServices.sendMessage(
      logedInUser._id,
      receiverId,
      message
    );

    return res.status(200).json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const logedInUser = await User.findOne({ email: req.user.email });
    const { message } = req.body;
    console.log("message: ", message);
    const chatId = req.params.chatId;

    const newMessage = await chatServices.sendGroupMessage(
      logedInUser._id,
      chatId,
      message
    );
    return res.status(200).json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export const createChat = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const logedInUser = await User.findOne({ email: req.user.email });

    const existingChat = await Chat.findOne({ name });
    if (existingChat) {
      return res.status(400).json({ error: "Chat already exists" });
    }

    const newChat = await chatServices.createChat(name, logedInUser._id);

    return res
      .status(201)
      .json({ message: "Chat created successfully", newChat });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const logedInUser = await User.findOne({ email: req.user.email });
    const { page } = req.query;

    const chats = await chatServices.getUserChats(logedInUser._id, page);

    return res.status(200).send({ chats });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;
    const logedInUser = await User.findOne({ email: req.user.email });
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const chat = await chatServices.getChatById(chatId, logedInUser._id);

    return res.status(200).json({ chat });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const addUserToGroupChat = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const chatId = req.params.id;
    const { users } = req.body;

    const loggedInUser = await User.findOne({ email: req.user.email });

    const chat = await chatServices.addUserToGroupChat(
      chatId,
      users,
      loggedInUser._id
    );

    return res.status(200).json({ message: "Users added successfully", chat });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const logedInUser = await User.findOne({ email: req.user.email });
    const { name, users } = req.body;
    console.log(name, users);
    const newGroup = await chatServices.createGroup(
      logedInUser._id,
      name,
      users
    );

    return res
      .status(201)
      .json({ message: "Group chat created successfully", newGroup });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    console.log("in get messages");
    const logedInUser = await User.findOne({ email: req.user.email });
    const chatId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    console.log("in get messages 1");

    const message = await chatServices.getMessages(
      logedInUser._id,
      chatId,
      page,
      limit
    );

    return res.status(200).json(message);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
};
