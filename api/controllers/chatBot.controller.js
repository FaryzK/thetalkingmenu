// src/controllers/chatBot.controller.js
import ChatBot from "../models/chatBot.model.js";
import { errorHandler } from "../utils/error.js";

export const getChatBot = async (req, res, next) => {
  const { restaurantId } = req.params;
  try {
    const chatBot = await ChatBot.findOne({ restaurantId });
    if (!chatBot) return next(errorHandler(404, "ChatBot not found"));
    res.status(200).json(chatBot);
  } catch (error) {
    next(errorHandler(500, "Failed to retrieve chatbot data"));
  }
};

export const updateSystemPrompt = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { systemPrompt } = req.body;
  try {
    const chatBot = await ChatBot.findOneAndUpdate(
      { restaurantId },
      { systemPrompt },
      { new: true }
    );
    if (!chatBot) return next(errorHandler(404, "ChatBot not found"));
    res.status(200).json({ systemPrompt: chatBot.systemPrompt });
  } catch (error) {
    next(errorHandler(500, "Failed to update system prompt"));
  }
};

export const updateSuggestedQuestions = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { suggestedQuestions } = req.body;
  try {
    const chatBot = await ChatBot.findOneAndUpdate(
      { restaurantId },
      { suggestedQuestions },
      { new: true }
    );
    if (!chatBot) return next(errorHandler(404, "ChatBot not found"));
    res.status(200).json({ suggestedQuestions: chatBot.suggestedQuestions });
  } catch (error) {
    next(errorHandler(500, "Failed to update suggested questions"));
  }
};
