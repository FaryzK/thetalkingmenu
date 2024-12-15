// src/controllers/chatbot.controller.js
import Chatbot from "../models/chatbot.model.js";
import { errorHandler } from "../utils/error.js";
import Restaurant from "../models/restaurant.model.js";
import Dashboard from "../models/dashboard.model.js";
import mongoose from "mongoose";

export const getChatbot = async (req, res, next) => {
  const { restaurantId } = req.params;
  try {
    const chatbot = await Chatbot.findOne({ restaurantId });
    if (!chatbot) return next(errorHandler(404, "Chatbot not found"));
    res.status(200).json(chatbot);
  } catch (error) {
    next(errorHandler(500, "Failed to retrieve chatbot data"));
  }
};

export const updateSystemPrompt = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { systemPrompt } = req.body;
  try {
    const chatbot = await Chatbot.findOneAndUpdate(
      { restaurantId },
      { systemPrompt },
      { new: true }
    );
    if (!chatbot) return next(errorHandler(404, "Chatbot not found"));
    res.status(200).json({ systemPrompt: chatbot.systemPrompt });
  } catch (error) {
    next(errorHandler(500, "Failed to update system prompt"));
  }
};

export const updateSuggestedQuestions = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { suggestedQuestions } = req.body;
  try {
    const chatbot = await Chatbot.findOneAndUpdate(
      { restaurantId },
      { suggestedQuestions },
      { new: true }
    );
    if (!chatbot) return next(errorHandler(404, "Chatbot not found"));
    res.status(200).json({ suggestedQuestions: chatbot.suggestedQuestions });
  } catch (error) {
    next(errorHandler(500, "Failed to update suggested questions"));
  }
};

// src/controllers/chatBot.controller.js
export const getChatbotAndRestaurantInfo = async (req, res, next) => {
  const { restaurantId } = req.params;
  try {
    const chatbot = await Chatbot.findOne({ restaurantId });
    const restaurant = await Restaurant.findById(
      restaurantId,
      "name location logo menuLink orderLink"
    );

    if (!chatbot || !restaurant) {
      return next(errorHandler(404, "Restaurant or chatbot not found"));
    }

    res.status(200).json({
      restaurantName: restaurant.name,
      restaurantLogo: restaurant.logo,
      restaurantLocation: restaurant.location,
      menuLink: restaurant.menuLink,
      orderLink: restaurant.orderLink,
      suggestedQuestions: chatbot.suggestedQuestions,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch data"));
  }
};

// Search for chatbots and include restaurant name, restaurant ID, and dashboard ID
export const searchChatbots = async (req, res, next) => {
  const { search = "", page = 1, limit = 20 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const chatbots = await Chatbot.find()
      .populate({
        path: "restaurantId",
        match: { name: { $regex: search, $options: "i" } },
      })
      .skip(skip)
      .limit(limit);

    // Filter out chatbots where the restaurant is null (because of populate + match)
    const filteredChatbots = chatbots.filter((chatbot) => chatbot.restaurantId);

    const totalChatbots = await Chatbot.countDocuments();

    // Attach dashboard ID for each restaurant
    const chatbotsWithDashboardData = await Promise.all(
      filteredChatbots.map(async (chatbot) => {
        const dashboard = await Dashboard.findOne({
          restaurants: chatbot.restaurantId._id,
        }).select("_id");

        return {
          _id: chatbot._id,
          status: chatbot.status,
          restaurantId: chatbot.restaurantId._id,
          restaurantName: chatbot.restaurantId.name,
          dashboardId: dashboard?._id || null,
        };
      })
    );

    res.status(200).json({
      chatbots: chatbotsWithDashboardData,
      currentPage: Number(page),
      totalPages: Math.ceil(totalChatbots / limit),
    });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch chatbots"));
  }
};

export const updateChatbotStatus = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { status } = req.body;

  // 🚩 Validate request body and URL params
  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId is required" });
  }

  if (!["on", "off"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Invalid status value. Must be 'on' or 'off'." });
  }

  try {
    // 🚩 Ensure restaurantId is an ObjectId
    const chatbot = await Chatbot.findOneAndUpdate(
      { restaurantId: new mongoose.Types.ObjectId(restaurantId) },
      { status },
      { new: true }
    ).populate("restaurantId", "name"); // Populate the restaurantId and only return its name

    if (!chatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    const responseData = {
      _id: chatbot._id,
      restaurantId: chatbot.restaurantId._id, // Restaurant ID
      restaurantName: chatbot.restaurantId.name, // Restaurant Name from populate
      status: chatbot.status, // Status of the chatbot
      systemPrompt: chatbot.systemPrompt, // (Optional) if you want to return more chatbot data
      suggestedQuestions: chatbot.suggestedQuestions, // (Optional)
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error updating chatbot status:", error);
    next(error);
  }
};
