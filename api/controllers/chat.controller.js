import Chat from "../models/chat.model.js";
import ChatBot from "../models/chatBot.model.js";
import Menu from "../models/menu.model.js";
import GlobalSystemPrompt from "../models/globalSystemPrompt.model.js";
import Restaurant from "../models/restaurant.model.js";
import TokenUsage from "../models/tokenUsage.model.js";
import { OpenAI } from "openai";
import { encode } from "gpt-tokenizer";
import User from "../models/user.model.js";

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

      // Save the updated chat
      await chat.save();

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

export const getChatsByRestaurant = async (req, res) => {
  const { restaurantId } = req.params; // Get the restaurant ID from the route
  const { page = 1, limit = 20 } = req.query; // Get pagination parameters

  try {
    // Ensure the restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Fetch chats with pagination
    const chats = await Chat.find({ restaurantId })
      .sort({ "messages.timestamp": -1 }) // Sort by latest message
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("_id messages"); // Only fetch required fields

    // Count total chats for pagination info
    const totalChats = await Chat.countDocuments({ restaurantId });

    res.status(200).json({
      chats: chats.map((chat) => ({
        _id: chat._id,
        firstMessage: chat.messages[0]?.message || "No messages", // Get the first message for preview
        timestamp: chat.messages[0]?.timestamp || null, // Get the timestamp of the first message
      })),
      totalChats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

export const getChatById = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Fetch the chat by ID
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({
      chatId: chat._id,
      restaurantId: chat.restaurantId,
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
};

export const toggleStarChat = async (req, res) => {
  const { chatId } = req.params; // Get chat ID from the route
  const { userId } = req.body; // Get user ID from the request body

  try {
    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the chat is already starred
    const isStarred = user.starredChats.includes(chatId);
    if (isStarred) {
      // If starred, remove it from the starredChats array
      user.starredChats.pull(chatId);
    } else {
      // If not starred, add it to the starredChats array
      user.starredChats.push(chatId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      starred: !isStarred, // Return the new starred status
    });
  } catch (error) {
    console.error("Error updating starred status:", error);
    res.status(500).json({ error: "Failed to update starred status" });
  }
};
