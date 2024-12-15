// src/routes/chatBot.route.js
import express from "express";

import {
  getChatbot,
  updateSystemPrompt,
  getChatbotAndRestaurantInfo,
  updateSuggestedQuestions,
  searchChatbots,
  updateChatbotStatus,
} from "../controllers/chatbot.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";
import { isAdmin } from "../utils/isAdmin.js";

const router = express.Router();

router.get("/:restaurantId", isAuthenticated, getChatbot);
router.patch("/:restaurantId", isAuthenticated, updateSystemPrompt);
router.patch(
  "/:restaurantId/suggested-questions",
  isAuthenticated,
  updateSuggestedQuestions
);
router.get("/:restaurantId/info", getChatbotAndRestaurantInfo);
router.get("/", isAuthenticated, isAdmin, searchChatbots);
router.patch(
  "/:restaurantId/status",
  isAuthenticated,
  isAdmin,
  updateChatbotStatus
);

export default router;
