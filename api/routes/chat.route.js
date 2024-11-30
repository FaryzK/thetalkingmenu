import express from "express";
import {
  sendMessage,
  startNewChat,
  getChatsByRestaurant,
  toggleStarChat,
  getChatById,
  getStarredChatsByRestaurant,
  searchChatsByKeyword,
} from "../controllers/chat.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router();

// POST route for starting a new chat session
router.post("/start-new-chat", startNewChat);

// POST route for sending a message
router.post("/send-message", sendMessage);

// Route to fetch chats with pagination
router.get("/:restaurantId/chats", isAuthenticated, getChatsByRestaurant);

// Route to star/unstar a chat
router.post("/:chatId/toggleStarChat", isAuthenticated, toggleStarChat);

router.get("/:chatId", getChatById); // Fetch a specific chat by ID

router.get(
  "/:restaurantId/starred",
  isAuthenticated,
  getStarredChatsByRestaurant
);

router.get("/:restaurantId/search", isAuthenticated, searchChatsByKeyword);

export default router;
