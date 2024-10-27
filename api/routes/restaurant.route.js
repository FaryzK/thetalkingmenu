import express from "express";
import {
  createRestaurant,
  getRestaurant,
} from "../controllers/restaurant.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router();

// POST route to create a new restaurant
router.post(
  "/dashboards/:dashboardId/restaurants",
  isAuthenticated,
  createRestaurant
);

// GET route to fetch a specific restaurant by ID
router.get("/restaurant/:restaurantId", isAuthenticated, getRestaurant);

export default router;
