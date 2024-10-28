import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";
import Chat from "../models/chat.model.js";
import Dashboard from "../models/dashboard.model.js";
import { errorHandler } from "../utils/error.js";

// Create a new restaurant
export const createRestaurant = async (req, res, next) => {
  const { name, location } = req.body;
  const restaurantOwnerId = req.user.uid; // assuming user UID from auth

  try {
    // Step 1: Create and save the restaurant
    const newRestaurant = new Restaurant({ name, location, restaurantOwnerId });
    await newRestaurant.save();

    // Step 2: Initialize Chat and Menu documents with the new restaurant's ID
    const initialChat = new Chat({
      restaurantId: newRestaurant._id,
      userId: restaurantOwnerId,
      messages: [], // initialize empty messages array
    });
    await initialChat.save();

    const initialMenu = new Menu({
      restaurantId: newRestaurant._id,
      menuItems: [], // initialize empty menuItems array
    });
    await initialMenu.save();

    // Step 3: Find the dashboard associated with the restaurant owner and add the new restaurant ID to the 'restaurants' array
    const updatedDashboard = await Dashboard.findOneAndUpdate(
      { dashboardOwnerId: restaurantOwnerId }, // Find dashboard by owner ID
      { $push: { restaurants: newRestaurant._id } }, // Add new restaurant ID to 'restaurants' array
      { new: true } // Return the updated document
    );

    // Step 4: Return response with the new restaurant, chat, and menu data if needed
    res.status(201).json({
      restaurant: newRestaurant,
      chat: initialChat,
      menu: initialMenu,
      dashboard: updatedDashboard,
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    next(errorHandler(500, "Failed to create restaurant"));
  }
};

// Get a specific restaurant by ID
export const getRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId)
      .populate("menu")
      .populate("chats");
    if (!restaurant) {
      return next(errorHandler(404, "Restaurant not found"));
    }
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    next(errorHandler(500, "Failed to fetch restaurant"));
  }
};
