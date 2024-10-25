import express from "express";
import {
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscriptions.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllSubscriptions); // Fetch all subscriptions
router.post("/", isAuthenticated, createSubscription); // Create new subscription
router.put("/:id", isAuthenticated, updateSubscription); // Update subscription by ID
router.delete("/:id", isAuthenticated, deleteSubscription); // Delete subscription by ID

export default router;
