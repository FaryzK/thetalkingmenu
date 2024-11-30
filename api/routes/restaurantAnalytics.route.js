import express from "express";
import { getRestaurantAnalytics } from "../controllers/restaurantAnalytics.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router();

router.get("/:restaurantId", isAuthenticated, getRestaurantAnalytics);

export default router;
