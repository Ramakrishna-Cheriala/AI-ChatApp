import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

export const generateResult = async (prompt) => {
  const result = await model.generateContent(prompt);
  console.log(result.response.text());

  return result.response.text();
};
