import express from "express";
import {
  createRestaurant,
  getRestaurant,
  getAllRestaurants,
  deleteRestaurant,
} from "../controllers/restaurant.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";
import { isAdmin } from "../utils/isAdmin.js";

const router = express.Router();

// Route to get all restaurants (restricted to admin)
router.get("/restaurants", isAuthenticated, isAdmin, getAllRestaurants);

// POST route to create a new restaurant
router.post(
  "/dashboards/:dashboardId/restaurants",
  isAuthenticated,
  createRestaurant
);

// GET route to fetch a specific restaurant by ID
router.get("/restaurant/:restaurantId", isAuthenticated, getRestaurant);

// DELETE route to delete a specific restaurant by ID (admin only)
router.delete(
  "/restaurants/:restaurantId",
  isAuthenticated,
  isAdmin,
  deleteRestaurant
);

export default router;
