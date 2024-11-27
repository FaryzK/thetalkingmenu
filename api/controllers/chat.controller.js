import Chat from "../models/chat.model.js";
import ChatBot from "../models/chatBot.model.js";
import Menu from "../models/menu.model.js";
import GlobalSystemPrompt from "../models/globalSystemPrompt.model.js";
import Restaurant from "../models/restaurant.model.js";
import TokenUsage from "../models/tokenUsage.model.js";
import { OpenAI } from "openai";
import { encode } from "gpt-tokenizer";

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
    // Proceed to create a new chat if token limit has not been reached
    const chat = new Chat({
      userId,
      restaurantId,
      messages: [],
      tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
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

  let chat, chatBot, globalSystemPrompt, menu, restaurant;

  try {
    // Fetch required documents
    globalSystemPrompt = await GlobalSystemPrompt.findOne();
    chatBot = await ChatBot.findOne({ restaurantId });
    menu = await Menu.findOne({ restaurantId });
    restaurant = await Restaurant.findById(restaurantId);

    // Prepare the chat messages
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat session not found" });
      }
    } else {
      chat = new Chat({ userId, restaurantId, messages: [] });
      await chat.save();
    }
    chat.messages.push({ message, sender: "user", timestamp: new Date() });
    await chat.save();

    // Estimate prompt tokens
    const openaiMessages = [
      { role: "system", content: globalSystemPrompt.prompt },
      { role: "system", content: chatBot.systemPrompt },
      {
        role: "system",
        content: `Restaurant Name: ${restaurant.name}; Restaurant Location: ${restaurant.location}`,
      },
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

    let promptTokens = 0;
    openaiMessages.forEach((msg) => {
      promptTokens += encode(msg.content).length;
    });

    // Set headers for streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let assistantMessage = "";
    let completionTokens = 0;

    try {
      // Stream the OpenAI response and estimate completion tokens
      const openaiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        stream: true,
      });

      for await (const chunk of openaiResponse) {
        const content = chunk.choices[0].delta.content || "";
        assistantMessage += content;
        res.write(content);

        // Estimate completion tokens for each streamed chunk
        completionTokens += encode(content).length;
      }
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      return res
        .status(500)
        .json({ error: "Error generating response from OpenAI" });
    }

    try {
      // Save assistant's message and update token usage
      chat.messages.push({
        message: assistantMessage,
        sender: "assistant",
        timestamp: new Date(),
      });

      // Update or create TokenUsage for the current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // Months are 0-based
      const currentYear = now.getFullYear();

      const tokenUsage = await TokenUsage.findOneAndUpdate(
        {
          restaurantId,
          month: currentMonth,
          year: currentYear,
        },
        {
          $inc: {
            "tokenUsageDetails.prompt_tokens": promptTokens,
            "tokenUsageDetails.completion_tokens": completionTokens,
            "tokenUsageDetails.total_tokens": promptTokens + completionTokens,
          },
        },
        { new: true, upsert: true } // Create if not exists
      );

      res.end();
    } catch (dbError) {
      console.error("Database error while saving assistant message:", dbError);
      return res
        .status(500)
        .json({ error: "Database error while saving assistant message" });
    }
  } catch (dbError) {
    console.error("Database error:", dbError);
    return res.status(500).json({ error: "Error fetching data from database" });
  }
};
