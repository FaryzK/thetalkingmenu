import express from "express";
import multer from "multer";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItem,
  //uploadMenuItems,
  addMenuItemsBulk,
} from "../controllers/menu.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router({ mergeParams: true }); // Allows access to :restaurantId
const upload = multer(); // Middleware for handling file uploads

// Route to get the menu for a specific restaurant
router.get("/restaurants/:restaurantId/menu", isAuthenticated, getMenu);

// Route to get a specific menu item by ID
router.get(
  "/restaurants/:restaurantId/menu/:menuItemId",
  isAuthenticated,
  getMenuItem
);

// Route to create a new menu item for a specific restaurant
router.post("/restaurants/:restaurantId/menu", isAuthenticated, createMenuItem);

// Route to update a specific menu item by its ID
router.put(
  "/restaurants/:restaurantId/menu/:menuItemId",
  isAuthenticated,
  updateMenuItem
);

// Route to delete a specific menu item by its ID
router.delete(
  "/restaurants/:restaurantId/menu/:menuItemId",
  isAuthenticated,
  deleteMenuItem
);

// Route to upload menu items in bulk via CSV
// router.post(
//   "/restaurants/:restaurantId/menu/upload",
//   isAuthenticated,
//   upload.single("file"), // File upload middleware
//   uploadMenuItems
// );

// Route to add menu items in bulk via JSON
router.post(
  "/restaurants/:restaurantId/menu/bulk",
  isAuthenticated,
  addMenuItemsBulk
);

export default router;
