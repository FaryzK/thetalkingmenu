import Chat from "../models/chat.model.js";
import Chatbot from "../models/chatbot.model.js";
import Menu from "../models/menu.model.js";
import GlobalSystemPrompt from "../models/globalSystemPrompt.model.js";
import Restaurant from "../models/restaurant.model.js";
import { OpenAI } from "openai";
import { encode } from "gpt-tokenizer";
import User from "../models/user.model.js";
import RestaurantAnalytics from "../models/restaurantAnalytics.model.js";
import UserChats from "../models/userChats.model.js";

export const updateRestaurantAnalytics = async (
  restaurantId,
  updates,
  currentMonth,
  currentYear
) => {
  try {
    // Fetch the current analytics document
    const analytics = await RestaurantAnalytics.findOne({ restaurantId });

    // Check if the monthly stats entry exists
    const monthlyStatIndex = analytics?.monthlyStats.findIndex(
      (stat) => stat.year === currentYear && stat.month === currentMonth
    );

    if (monthlyStatIndex !== -1) {
      // Update existing monthly stats and increment overall counters
      const updateQuery = {};
      for (const key in updates) {
        if (key.startsWith("monthlyStats")) {
          const [, field] = key.split(".$[elem].");
          updateQuery[`monthlyStats.${monthlyStatIndex}.${field}`] =
            (analytics.monthlyStats[monthlyStatIndex][field] || 0) +
            updates[key];
        } else {
          // Increment overall counters
          updateQuery[key] = (analytics[key] || 0) + updates[key];
        }
      }

      await RestaurantAnalytics.updateOne(
        { restaurantId },
        { $set: updateQuery }
      );
    } else {
      // Create a new monthly stats entry if not exists and update overall counters
      const newMonthlyStat = {
        year: currentYear,
        month: currentMonth,
        chats: updates["monthlyStats.$[elem].chats"] || 0,
        messages: updates["monthlyStats.$[elem].messages"] || 0,
        total_tokens: updates["monthlyStats.$[elem].total_tokens"] || 0,
        prompt_tokens: updates["monthlyStats.$[elem].prompt_tokens"] || 0,
        completion_tokens:
          updates["monthlyStats.$[elem].completion_tokens"] || 0,
      };

      const overallUpdates = {
        totalChats: updates.totalChats || 0,
        totalMessages: updates.totalMessages || 0,
        total_tokens: updates.total_tokens || 0,
        total_prompt_tokens: updates.prompt_tokens || 0,
        total_completion_tokens: updates.completion_tokens || 0,
      };

      await RestaurantAnalytics.updateOne(
        { restaurantId },
        {
          $push: {
            monthlyStats: {
              $each: [newMonthlyStat],
              $sort: { year: -1, month: -1 },
            },
          },
          $inc: overallUpdates,
        }
      );
    }
  } catch (error) {
    console.error("Error updating RestaurantAnalytics:", error);
    throw new Error("Failed to update restaurant analytics");
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Controller to start a new chat session
export const startNewChat = async (req, res, next) => {
  const { restaurantId, userId = null, tableNumber } = req.body;
  const sessionToken = req.sessionToken;

  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId is required" });
  }

  try {
    // Proceed to create a new chat if token limit has not been reached
    const chat = new Chat({
      sessionToken,
      userId,
      restaurantId,
      tableNumber,
      messages: [],
      tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    });
    await chat.save();

    // If userId is present, update the UserChats collection
    if (userId) {
      let userChats = await UserChats.findOne({ userId });

      if (!userChats) {
        // Create a new UserChats document if doesn't exist
        userChats = new UserChats({
          userId,
          chatIds: [chat._id], // Insert the new chat at the start
        });
      } else {
        // Prepend the new chatId to the front of the array
        userChats.chatIds.unshift(chat._id);
      }

      await userChats.save();
    }

    // Update RestaurantAnalytics
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await updateRestaurantAnalytics(
      restaurantId,
      { totalChats: 1, "monthlyStats.$[elem].chats": 1 },
      currentMonth,
      currentYear
    );

    res.status(201).json({ chatId: chat._id });
  } catch (error) {
    console.error("Error creating new chat session:", error);
    res.status(500).json({ error: "Error creating new chat session" });
  }
};

// Existing sendMessage function remains as is
export const sendMessage = async (req, res, next) => {
  const {
    message,
    restaurantId,
    chatId = null,
    userId = null,
    tableNumber,
  } = req.body;

  const sessionToken = req.sessionToken; // 🟢 Extract session token from req object

  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId is required" });
  }

  let chat, chatbot, globalSystemPrompt, menu, restaurant;

  try {
    // 🚩 Check if chatbot is active before doing anything else
    chatbot = await Chatbot.findOne({ restaurantId });
    if (!chatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    if (chatbot.status === "off") {
      return res
        .status(403)
        .json({ error: "This chatbot has been turned off." });
    }

    // Fetch required documents
    globalSystemPrompt = await GlobalSystemPrompt.findOne();
    chatbot = await Chatbot.findOne({ restaurantId });
    menu = await Menu.findOne({ restaurantId });
    restaurant = await Restaurant.findById(restaurantId);

    // Get current date and time
    const now = new Date();
    const singaporeTime = now.toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
    });

    // Prepare the chat messages
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      if (chat.tableNumber !== tableNumber) {
        return res.status(400).json({
          error: `Invalid tableNumber for this chat. Expected ${chat.tableNumber}, got ${tableNumber}`,
        });
      }
    } else {
      chat = new Chat({
        userId,
        restaurantId,
        tableNumber,
        sessionToken,
        messages: [],
      });
      await chat.save();
    }
    chat.messages.push({ message, sender: "user", timestamp: new Date() });
    await chat.save();

    // Estimate prompt tokens
    const openaiMessages = [
      { role: "system", content: globalSystemPrompt.prompt },
      { role: "system", content: chatbot.systemPrompt },
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
      {
        role: "system",
        content: `The current date and time is: ${singaporeTime}`,
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

      chat.tokenUsage.prompt_tokens += promptTokens;
      chat.tokenUsage.completion_tokens += completionTokens;
      chat.tokenUsage.total_tokens += promptTokens + completionTokens;

      await chat.save();

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Update RestaurantAnalytics for messages and tokens
      await updateRestaurantAnalytics(
        restaurantId,
        {
          totalMessages: 1,
          total_tokens: promptTokens + completionTokens,
          total_prompt_tokens: promptTokens,
          total_completion_tokens: completionTokens,
          "monthlyStats.$[elem].messages": 1,
          "monthlyStats.$[elem].total_tokens": promptTokens + completionTokens,
          "monthlyStats.$[elem].prompt_tokens": promptTokens,
          "monthlyStats.$[elem].completion_tokens": completionTokens,
        },
        currentMonth,
        currentYear
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
  const { uid } = req.user;
  const page = parseInt(req.query.page) || 1; // Convert to integer, default to 1
  const limit = parseInt(req.query.limit) || 20; // Convert to integer, default to 20

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract MongoDB userId (ObjectId) from the user document
    const userId = user._id;

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
      .select("_id messages tableNumber seenBy"); // Only fetch required fields

    // Count total chats for pagination info
    const totalChats = await Chat.countDocuments({ restaurantId });

    res.status(200).json({
      chats: chats.map((chat) => ({
        _id: chat._id,
        firstMessage: chat.messages[0]?.message || "No messages", // Get the first message for preview
        timestamp: chat.messages[0]?.timestamp || null, // Get the timestamp of the first message
        tableNumber: chat.tableNumber || "default", // Include table number
        isSeen: Array.isArray(chat.seenBy)
          ? chat.seenBy.includes(userId)
          : false, // Check if user ID is in the seenBy array
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
  const { uid } = req.user; // Get user ID from the request body

  try {
    // Fetch the user
    const user = await User.findOne({ uid });

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

export const getStarredChatsByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  const { uid } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  try {
    // Fetch only the starred chat IDs for the user
    const user = await User.findOne({ uid }, "starredChats").lean();
    const starredChatIds = user.starredChats;

    // Count total starred chats for the restaurant
    const totalChats = await Chat.countDocuments({
      _id: { $in: starredChatIds },
      restaurantId,
    });

    // Fetch paginated starred chats
    const chats = await Chat.find({
      _id: { $in: starredChatIds },
      restaurantId,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      chats: chats.map((chat) => ({
        _id: chat._id,
        firstMessage: chat.messages[0]?.message || "No messages",
        timestamp: chat.messages[0]?.timestamp || null,
      })),
      totalChats,
    });
  } catch (error) {
    console.error("Error fetching starred chats:", error);
    res.status(500).json({ error: "Failed to fetch starred chats" });
  }
};

export const searchChatsByKeyword = async (req, res) => {
  const { restaurantId } = req.params;
  const { keyword, starred } = req.query;
  const { uid } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required for search" });
  }

  try {
    let totalChats = 0;
    let chats = [];

    if (starred === "true") {
      // Fetch only the IDs of starred chats for the user
      const user = await User.findOne({ uid }, "starredChats").lean();
      const starredChatIds = user.starredChats.map((chat) => chat._id);

      // Count matching starred chats
      totalChats = await Chat.countDocuments({
        _id: { $in: starredChatIds },
        restaurantId,
        "messages.message": { $regex: keyword, $options: "i" },
      });

      // Fetch paginated starred chats
      chats = await Chat.find({
        _id: { $in: starredChatIds },
        restaurantId,
        "messages.message": { $regex: keyword, $options: "i" },
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    } else {
      // Count matching non-starred chats
      totalChats = await Chat.countDocuments({
        restaurantId,
        "messages.message": { $regex: keyword, $options: "i" },
      });

      // Fetch paginated non-starred chats
      chats = await Chat.find({
        restaurantId,
        "messages.message": { $regex: keyword, $options: "i" },
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    res.status(200).json({
      chats: chats.map((chat) => ({
        _id: chat._id,
        firstMessage: chat.messages[0]?.message || "No messages",
        timestamp: chat.messages[0]?.timestamp || null,
      })),
      totalChats, // Total matching chats across all pages
    });
  } catch (error) {
    console.error("Error searching chats:", error);
    res.status(500).json({ error: "Failed to search chats" });
  }
};

// Controller to delete a chat
export const deleteChat = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Find the chat to delete
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const { restaurantId, tokenUsage } = chat;

    // Filter user messages
    const userMessages = chat.messages.filter((msg) => msg.sender === "user");
    const userMessageCount = userMessages.length;

    // Remove the chat
    await Chat.findByIdAndDelete(chatId);

    // Update restaurant analytics
    const analytics = await RestaurantAnalytics.findOne({ restaurantId });
    if (analytics) {
      // Update total stats
      analytics.totalChats = Math.max(0, analytics.totalChats - 1);
      analytics.totalMessages = Math.max(
        0,
        analytics.totalMessages - userMessageCount
      );
      analytics.total_tokens = Math.max(
        0,
        analytics.total_tokens - (tokenUsage?.total_tokens || 0)
      );
      analytics.total_prompt_tokens = Math.max(
        0,
        analytics.total_prompt_tokens - (tokenUsage?.prompt_tokens || 0)
      );
      analytics.total_completion_tokens = Math.max(
        0,
        analytics.total_completion_tokens - (tokenUsage?.completion_tokens || 0)
      );

      // Update monthly stats
      const chatMonth = new Date(chat.messages[0]?.timestamp).getMonth() + 1;
      const chatYear = new Date(chat.messages[0]?.timestamp).getFullYear();

      const monthlyStats = analytics.monthlyStats.find(
        (stat) => stat.year === chatYear && stat.month === chatMonth
      );

      if (monthlyStats) {
        monthlyStats.chats = Math.max(0, monthlyStats.chats - 1);
        monthlyStats.messages = Math.max(
          0,
          monthlyStats.messages - userMessageCount
        );
        monthlyStats.total_tokens = Math.max(
          0,
          monthlyStats.total_tokens - (tokenUsage?.total_tokens || 0)
        );
        monthlyStats.prompt_tokens = Math.max(
          0,
          monthlyStats.prompt_tokens - (tokenUsage?.prompt_tokens || 0)
        );
        monthlyStats.completion_tokens = Math.max(
          0,
          monthlyStats.completion_tokens - (tokenUsage?.completion_tokens || 0)
        );
      }

      await analytics.save();
    }

    // Remove the chat ID from user's starred chats
    await User.updateMany(
      { starredChats: chatId },
      { $pull: { starredChats: chatId } }
    );

    // Remove the chat ID from UserChat documents
    await UserChats.updateMany(
      { chatIds: chatId },
      { $pull: { chatIds: chatId } }
    );

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
      updatedStats: {
        totalChats: analytics?.totalChats,
        totalMessages: analytics?.totalMessages,
        totalTokens: analytics?.total_tokens,
      },
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};

export const markChatAsSeen = async (req, res) => {
  const { chatId } = req.params;
  const { uid } = req.user; // Extract user ID from authenticated request

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (!chat.seenBy.includes(user._id)) {
      chat.seenBy.push(user._id);
      await chat.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking chat as seen:", error);
    res.status(500).json({ error: "Failed to mark chat as seen" });
  }
};
