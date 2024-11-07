import express from "express";
import { sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();

// POST route for sending a message
router.post("/send-message", sendMessage);

export default router;
