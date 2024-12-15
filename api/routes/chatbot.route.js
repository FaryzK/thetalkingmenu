// src/routes/chatBot.route.js
import express from "express";
import {
  getChatbot,
  updateSystemPrompt,
  getChatbotAndRestaurantInfo,
} from "../controllers/chatbot.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";
import { updateSuggestedQuestions } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.get("/:restaurantId", isAuthenticated, getChatbot);
router.patch("/:restaurantId", isAuthenticated, updateSystemPrompt);
router.patch(
  "/:restaurantId/suggested-questions",
  isAuthenticated,
  updateSuggestedQuestions
);
router.get("/:restaurantId/info", getChatbotAndRestaurantInfo);

export default router;
