import User from "../models/user.model.js";
import * as ai from "../services/ai.service.js";

export const generateResult = async (req, res) => {
  try {
    const { prompt } = req.body;
    const { chatId } = req.params.chatId;
    const result = await ai.generateResult(prompt, chatId);
    return res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
