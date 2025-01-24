import mongoose from "mongoose";
import Chat from "../models/chat.model.js";

import Message from "../models/message.model.js";

export const sendMessage = async (
  senderId,
  receiverId,
  content,
  isAI = false
) => {
  try {
    let chat = await Chat.findOne({
      chatType: "private",
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = new Chat({
        chatType: "private",
        participants: [senderId, receiverId],
      });
      await chat.save();
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      chat: chat._id,
      content,
      isAI,
    });
    await message.save();

    return message;
  } catch (error) {
    console.error("Error sending message:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendGroupMessage = async (
  senderId,
  chatId,
  content,
  isAI = false
) => {
  try {
    console.log(senderId);
    const chat = await Chat.findOne({
      _id: chatId,
      chatType: "group",
    });

    if (!chat) {
      throw new Error("Group chat not found.");
    }

    const isParticipant = chat.participants.some(
      (user) => user.toString() === senderId.toString()
    );
    if (!isParticipant) {
      throw new Error("Sender is not a participant of this group.");
    }

    const message = new Message({
      sender: senderId,
      chat: chatId,
      content,
      isAI,
    });
    await message.save();

    return message;
  } catch (error) {
    console.error("Error sending group message:", error.message);
    return { success: false, error: error.message };
  }
};

export const createChat = async (name, userId) => {
  if (!userId && !name) {
    throw new Error("Name and user are required");
  }

  const chat = await Chat.create({ name, users: [userId] });

  return chat;
};

export const getChatById = async (chatId, logedInUserId) => {
  if (!chatId) {
    throw new Error("Chat ID is required");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    users: logedInUserId,
  }).populate({
    path: "users",
    select: "email",
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return chat;
};

export const addUserToGroupChat = async (chatId, users, loggedInUserId) => {
  if (!chatId) {
    throw new Error("Chat ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new Error("Invalid Chat ID");
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new Error(
      "At least one user ID is required to add to the group chat"
    );
  }

  if (users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!loggedInUserId) {
    throw new Error("Logged-in User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
    throw new Error("Invalid Logged-in User ID");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    chatType: "group",
    participants: { $in: [loggedInUserId] },
  });

  if (!chat) {
    throw new Error("Group chat not found or the user is not a participant");
  }

  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    { $addToSet: { users: { $each: users } } }, // `$addToSet` ensures no duplicate users are added
    { new: true }
  ).populate({
    path: "participants",
    select: "email username",
    model: "user",
  });

  return updatedChat;
};

export const getUserChats = async (userId, page = 1, limit = 20) => {
  try {
    console.log(userId);
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ participants: { $in: [userId] } })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-messages")
      .populate({
        path: "participants",
        select: "email username",
        model: "user",
      });

    const formattedChats = chats.map((chat) => {
      if (chat.chatType === "group") {
        return {
          _id: chat._id,
          chatName: chat.chatName,
          chatType: chat.chatType,
          users: chat.users,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      }

      const otherUser = chat.participants.find(
        (user) => user._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        chatName: otherUser?.email || "Unknown User",
        chatType: chat.chatType,
        participants: chat.participants,
        createdAt: chat.createdAt,
      };
    });

    return formattedChats;
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    throw new Error("Failed to fetch chats");
  }
};

export const createGroup = async (creatorId, groupName, participantIds) => {
  try {
    if (!groupName || typeof groupName !== "string") {
      throw new Error("Group name is required and must be a string.");
    }

    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
      throw new Error("A valid creator ID is required.");
    }

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      throw new Error("Participant IDs are required.");
    }

    const validParticipantIds = participantIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (validParticipantIds.length !== participantIds.length) {
      throw new Error("Invalid participant ID(s) provided.");
    }

    const allParticipantIds = [creatorId, ...validParticipantIds];

    const uniqueParticipants = [...new Set(allParticipantIds)];
    if (uniqueParticipants.length < 2) {
      throw new Error("A group must have at least two participants.");
    }

    const groupChat = await Chat.create({
      chatName: groupName,
      chatType: "group",
      participants: uniqueParticipants,
    });

    await groupChat.save();

    return groupChat;
  } catch (error) {
    console.error("Error creating group:", error.message);
    throw new Error("Failed to create group.");
  }
};

export const getMessages = async (userId, chatId, page = 1, limit = 20) => {
  try {
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      throw new Error("Invalid or missing chat ID");
    }
    const totalMessages = await Message.countDocuments({ chat: chatId });
    const totalPages = Math.ceil(totalMessages / limit);

    // Calculate skip to get the correct range of messages
    const skip = Math.max(0, totalMessages - page * limit);
    const remainingMessages = totalMessages - (page - 1) * limit;
    const fetchLimit = Math.min(limit, remainingMessages);

    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (!chat.participants.includes(userId)) {
      throw new Error("User is not a participant of this chat");
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ sentAt: 1 })
      .skip(skip)
      .limit(fetchLimit)
      .populate({
        path: "sender",
        select: "username email",
        model: "user",
      });

    return {
      success: true,
      messages,
      pagination: {
        page,
        limit: fetchLimit,
        totalMessages,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
