import Chat from "../models/chat.model.js";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const sendMessage = async (req, res, next) => {
  const { message, restaurantId, userId = null } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId is required" });
  }

  let chat;
  try {
    chat = await Chat.findOne({ restaurantId, userId });
    if (!chat) {
      chat = new Chat({
        userId,
        restaurantId,
        messages: [],
      });
    }
  } catch (dbError) {
    console.error(
      "Database error while fetching/creating chat session:",
      dbError
    );
    return res
      .status(500)
      .json({ error: "Database error while fetching chat session" });
  }

  try {
    chat.messages.push({
      message,
      sender: "user",
      timestamp: new Date(),
    });
    await chat.save();
  } catch (dbError) {
    console.error("Database error while saving user message:", dbError);
    return res
      .status(500)
      .json({ error: "Database error while saving user message" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let assistantMessage = "";
  try {
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...chat.messages.map((msg) => ({
          role: msg.sender,
          content: msg.message,
        })),
      ],
      stream: true,
    });

    for await (const chunk of openaiResponse) {
      const content = chunk.choices[0].delta.content || "";
      assistantMessage += content;
      res.write(content); // Send each chunk to the client
    }
  } catch (apiError) {
    console.error("Error during OpenAI API request:", apiError);
    return res
      .status(500)
      .json({ error: "Error during OpenAI response streaming" });
  }

  try {
    chat.messages.push({
      message: assistantMessage,
      sender: "assistant",
      timestamp: new Date(),
    });
    await chat.save();
  } catch (dbError) {
    console.error("Database error while saving assistant message:", dbError);
    return res
      .status(500)
      .json({ error: "Database error while saving assistant message" });
  }

  res.end();
};
