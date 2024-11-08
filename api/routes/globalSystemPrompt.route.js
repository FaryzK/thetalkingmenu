// routes/globalSystemPrompt.route.js
import express from "express";
import {
  getGlobalSystemPrompt,
  createGlobalSystemPrompt,
  updateGlobalSystemPrompt,
} from "../controllers/globalSystemPrompt.controller.js";

const router = express.Router();

router.get("/", getGlobalSystemPrompt);
router.post("/", createGlobalSystemPrompt);
router.put("/", updateGlobalSystemPrompt);

export default router;
