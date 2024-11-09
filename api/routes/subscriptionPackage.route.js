import express from "express";
import {
  getAllSubscriptionPackages,
  createSubscriptionPackage,
  updateSubscriptionPackage,
  deleteSubscriptionPackage,
} from "../controllers/subscriptionPackage.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllSubscriptionPackages); // Fetch all subscriptions
router.post("/", isAuthenticated, createSubscriptionPackage); // Create new subscription
router.put("/:id", isAuthenticated, updateSubscriptionPackage); // Update subscription by ID
router.delete("/:id", isAuthenticated, deleteSubscriptionPackage); // Delete subscription by ID

export default router;
