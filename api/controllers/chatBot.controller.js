// src/controllers/chatbot.controller.js
import Chatbot from "../models/chatbot.model.js";
import { errorHandler } from "../utils/error.js";
import Restaurant from "../models/restaurant.model.js";

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
