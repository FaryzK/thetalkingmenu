// src/routes/chatBot.route.js
import express from "express";
import {
  getChatBot,
  updateSystemPrompt,
  getChatBotAndRestaurantInfo,
} from "../controllers/chatBot.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";
import { updateSuggestedQuestions } from "../controllers/chatBot.controller.js";

const router = express.Router();

router.get("/:restaurantId", isAuthenticated, getChatBot);
router.patch("/:restaurantId", isAuthenticated, updateSystemPrompt);
router.patch(
  "/:restaurantId/suggested-questions",
  isAuthenticated,
  updateSuggestedQuestions
);
router.get("/:restaurantId/info", getChatBotAndRestaurantInfo);

export default router;
