// restaurant.route.js
import express from "express";
import {
  createRestaurant,
  getRestaurant,
  getAllRestaurants,
  deleteRestaurant,
  updateRestaurant,
  transferOwnership,
} from "../controllers/restaurant.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";
import { isAdmin } from "../utils/isAdmin.js";

const router = express.Router();

// Route to get all restaurants (restricted to admin)
router.get("/", isAuthenticated, isAdmin, getAllRestaurants);

// POST route to create a new restaurant
router.post("/", isAuthenticated, createRestaurant);

// GET route to fetch a specific restaurant by ID
router.get("/:restaurantId", isAuthenticated, getRestaurant);

// PUT route to update restaurant info
router.put("/:restaurantId", isAuthenticated, updateRestaurant);

// DELETE route to delete a specific restaurant by ID (admin only)
router.delete("/:restaurantId", isAuthenticated, isAdmin, deleteRestaurant);

router.put(
  "/:restaurantId/transfer",
  isAuthenticated,
  isAdmin,
  transferOwnership
);

export default router;
