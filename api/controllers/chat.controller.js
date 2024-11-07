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

  try {
    let chat = await Chat.findOne({ restaurantId, userId });
    if (!chat) {
      chat = new Chat({
        userId,
        restaurantId,
        messages: [],
      });
    }

    chat.messages.push({
      message,
      sender: "user",
      timestamp: new Date(),
    });

    await chat.save();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

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

    let assistantMessage = "";
    for await (const chunk of openaiResponse) {
      const content = chunk.choices[0].delta.content || "";
      assistantMessage += content;
      res.write(content);
    }

    chat.messages.push({
      message: assistantMessage,
      sender: "assistant",
      timestamp: new Date(),
    });

    await chat.save();
    res.end();
  } catch (error) {
    console.error("Error in sendMessage:", error);
    next(error);
  }
};
