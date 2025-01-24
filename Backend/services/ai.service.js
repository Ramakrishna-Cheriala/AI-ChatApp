import { GoogleGenerativeAI } from "@google/generative-ai";
import { prompt } from "./Prompt.js";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
  generationConfig: {
    // responseMimeType: "application/json",
    temperature: 0.4,
  },
  systemInstruction: prompt,
});

export const generateResult = async (prompt, chatId, userId) => {
  try {
    const result = await model.generateContent(prompt);
    // const logedInUser = await User.findOne({ email: req.user.email });

    const responseText = result.response.text().trim();

    const aiMessage = new Message({
      sender: userId,
      recipient: null,
      content: responseText,
      isAI: true,
      chat: chatId,
    });

    await aiMessage.save();

    return responseText;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
};
