import express from "express";
import { sendMessage, startNewChat } from "../controllers/chat.controller.js";

const router = express.Router();

// POST route for starting a new chat session
router.post("/start-new-chat", startNewChat);

// POST route for sending a message
router.post("/send-message", sendMessage);

export default router;
