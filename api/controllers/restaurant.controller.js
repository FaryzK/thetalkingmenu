import pkg from "draft-js";
import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";
import Chat from "../models/chat.model.js";
import ChatBot from "../models/chatBot.model.js";
import Dashboard from "../models/dashboard.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

const { ContentState, convertToRaw, EditorState, SelectionState, RichUtils } =
  pkg;

// Helper for formatted content
const createFormattedContent = (textArray) => {
  const contentState = ContentState.createFromText(textArray.join("\n"));
  let editorState = EditorState.createWithContent(contentState);
  const selection = SelectionState.createEmpty(
    contentState.getFirstBlock().getKey()
  ).merge({ focusOffset: textArray[0].length });
  editorState = EditorState.acceptSelection(editorState, selection);
  editorState = RichUtils.toggleInlineStyle(editorState, "BOLD");
  return convertToRaw(editorState.getCurrentContent());
};

// Create a new restaurant
export const createRestaurant = async (req, res, next) => {
  const { name, location } = req.body;
  const restaurantOwnerId = req.user.uid; // assuming user UID from auth

  try {
    const owner = await User.findOne({ uid: restaurantOwnerId });
    const owner_role = "restaurant main admin";
    if (!owner) return next(errorHandler(404, "Owner not found"));

    const newRestaurant = new Restaurant({
      name,
      location,
      restaurantOwnerId,
      userAccess: [
        {
          userId: owner.uid,
          userEmail: owner.email,
          role: owner_role,
        },
      ],
    });
    await newRestaurant.save();

    const defaultQuestions = [
      createFormattedContent([
        "I want a meal around $15",
        "to keep within my budget.",
      ]),
      createFormattedContent([
        "I’m feeling for something light",
        "so I won’t get bloated.",
      ]),
    ];

    const initialChatBot = new ChatBot({
      restaurantId: newRestaurant._id,
      systemPrompt:
        "Your job is to help answer questions, provide information, and engage in conversations about the restaurant.",
      suggestedQuestions: defaultQuestions,
    });
    await initialChatBot.save();

    const initialChat = new Chat({
      restaurantId: newRestaurant._id,
      userId: restaurantOwnerId,
      messages: [],
    });
    await initialChat.save();

    const initialMenu = new Menu({
      restaurantId: newRestaurant._id,
      menuItems: [],
    });
    await initialMenu.save();

    const updatedDashboard = await Dashboard.findOneAndUpdate(
      { dashboardOwnerId: restaurantOwnerId },
      { $push: { restaurants: newRestaurant._id } },
      { new: true }
    );

    owner.accessibleRestaurants.push(newRestaurant._id.toString());
    await owner.save();

    res.status(201).json({
      restaurant: newRestaurant,
      chatBot: initialChatBot,
      chat: initialChat,
      menu: initialMenu,
      dashboard: updatedDashboard,
      accessibleRestaurants: owner.accessibleRestaurants,
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
    if (!restaurant) return next(errorHandler(404, "Restaurant not found"));
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    next(errorHandler(500, "Failed to fetch restaurant"));
  }
};

// Fetch all restaurants (restricted to admin)
export const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("menu")
      .populate("chats");

    const ownerIds = restaurants.map(
      (restaurant) => restaurant.restaurantOwnerId
    );
    const owners = await User.find({ uid: { $in: ownerIds } }, "uid email");

    const ownerEmailMap = owners.reduce((acc, owner) => {
      acc[owner.uid] = owner.email;
      return acc;
    }, {});

    const restaurantsWithOwners = restaurants.map((restaurant) => ({
      ...restaurant.toObject(),
      ownerEmail:
        ownerEmailMap[restaurant.restaurantOwnerId] || "Owner not found",
    }));

    res.status(200).json(restaurantsWithOwners);
  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    next(errorHandler(500, "Failed to fetch restaurants"));
  }
};

// Update restaurant information by ID
export const updateRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { name, location, logo } = req.body; // Assume the updated data is sent in the body

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return next(errorHandler(404, "Restaurant not found"));

    // Update fields if they are provided
    if (name) restaurant.name = name;
    if (location) restaurant.location = location;
    if (logo) restaurant.logo = logo;

    await restaurant.save();

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    next(errorHandler(500, "Failed to update restaurant information"));
  }
};

// Delete restaurant by ID and associated data
export const deleteRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return next(errorHandler(404, "Restaurant not found"));

    await ChatBot.deleteMany({ restaurantId: restaurant._id });
    await Chat.deleteMany({ restaurantId: restaurant._id });
    await Menu.deleteMany({ restaurantId: restaurant._id });

    await User.updateMany(
      { accessibleRestaurants: restaurant._id.toString() },
      { $pull: { accessibleRestaurants: restaurant._id.toString() } }
    );

    await Dashboard.updateMany(
      { restaurants: restaurant._id },
      { $pull: { restaurants: restaurant._id } }
    );

    await restaurant.deleteOne();
    res
      .status(200)
      .json({ message: "Restaurant and associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    next(errorHandler(500, "Failed to delete restaurant"));
  }
};
