import Chat from "../models/chat.model.js";
import ChatBot from "../models/chatBot.model.js";
import Menu from "../models/menu.model.js";
import GlobalSystemPrompt from "../models/globalSystemPrompt.model.js";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Controller to start a new chat session
export const startNewChat = async (req, res, next) => {
  const { restaurantId, userId = null } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId is required" });
  }

  try {
    // Create a new chat session
    const chat = new Chat({
      userId,
      restaurantId,
      messages: [],
    });
    await chat.save();

    res.status(201).json({ chatId: chat._id });
  } catch (error) {
    console.error("Error creating new chat session:", error);
    res.status(500).json({ error: "Error creating new chat session" });
  }
};

// Existing sendMessage function remains as is
export const sendMessage = async (req, res, next) => {
  const { message, restaurantId, chatId = null, userId = null } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId is required" });
  }

  let chat, chatBot, globalSystemPrompt, menu;

  try {
    // 1. Fetch prompts and menu
    globalSystemPrompt = await GlobalSystemPrompt.findOne();
    chatBot = await ChatBot.findOne({ restaurantId });
    menu = await Menu.findOne({ restaurantId });

    if (!globalSystemPrompt || !chatBot) {
      throw new Error("System prompts or chatbot details are missing.");
    }

    // 2. Find or create a new chat session
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat session not found" });
      }
    } else {
      chat = new Chat({
        userId,
        restaurantId,
        messages: [],
      });
      await chat.save();
    }

    // 3. Add the user's message to the chat history
    chat.messages.push({
      message,
      sender: "user",
      timestamp: new Date(),
    });
    await chat.save();
  } catch (dbError) {
    console.error("Database error:", dbError);
    return res.status(500).json({ error: "Error fetching data from database" });
  }

  // Set headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let assistantMessage = "";

  try {
    // Prepare OpenAI prompt
    const openaiMessages = [
      { role: "system", content: globalSystemPrompt.prompt },
      { role: "system", content: chatBot.systemPrompt },
      {
        role: "system",
        content: `Menu details: ${menu.menuItems
          .map((item) => `${item.name} - ${item.description} ($${item.price})`)
          .join("; ")}`,
      },
      ...chat.messages.map((msg) => ({
        role: msg.sender,
        content: msg.message,
      })),
    ];

    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
      stream: true,
    });

    for await (const chunk of openaiResponse) {
      const content = chunk.choices[0].delta.content || "";
      assistantMessage += content;
      res.write(content);
    }
  } catch (apiError) {
    console.error("OpenAI API error:", apiError);
    return res
      .status(500)
      .json({ error: "Error generating response from OpenAI" });
  }

  try {
    // Save assistant's message to the chat history
    chat.messages.push({
      message: assistantMessage,
      sender: "assistant",
      timestamp: new Date(),
    });
    await chat.save();
    res.end();
  } catch (dbError) {
    console.error("Database error while saving assistant message:", dbError);
    return res
      .status(500)
      .json({ error: "Database error while saving assistant message" });
  }
};
