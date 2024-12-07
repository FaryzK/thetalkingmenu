import pkg from "draft-js";
import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";
import Chat from "../models/chat.model.js";
import ChatBot from "../models/chatBot.model.js";
import Dashboard from "../models/dashboard.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import RestaurantAnalytics from "../models/restaurantAnalytics.model.js";
import UserChats from "../models/userChats.model.js";
import dotenv from "dotenv";

dotenv.config();

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

    // Initialize RestaurantAnalytics for the new restaurant
    const newRestaurantAnalytics = new RestaurantAnalytics({
      restaurantId: newRestaurant._id,
    });
    await newRestaurantAnalytics.save();

    const defaultQuestions = [
      createFormattedContent(["What's on your menu?", "Break it down for me!"]),
      createFormattedContent([
        "I’d like to try something unique.",
        "What stands out?",
      ]),
    ];

    const initialChatBot = new ChatBot({
      restaurantId: newRestaurant._id,
      systemPrompt:
        "Your job is to help answer questions, provide information, and engage in conversations about the restaurant.",
      suggestedQuestions: defaultQuestions,
    });
    await initialChatBot.save();

    // const initialChat = new Chat({
    //   restaurantId: newRestaurant._id,
    //   userId: restaurantOwnerId,
    //   messages: [],
    // });
    // await initialChat.save();

    const initialMenu = new Menu({
      restaurantId: newRestaurant._id,
      menuItems: [],
    });
    await initialMenu.save();

    // Find the dashboard and associate the new restaurant
    const updatedDashboard = await Dashboard.findOneAndUpdate(
      { dashboardOwnerId: restaurantOwnerId },
      { $push: { restaurants: newRestaurant._id } },
      { new: true }
    );

    if (!updatedDashboard) {
      return next(errorHandler(404, "Dashboard not found"));
    }

    owner.accessibleRestaurants.push(newRestaurant._id.toString());
    await owner.save();

    res.status(201).json({
      restaurant: newRestaurant,
      chatBot: initialChatBot,
      // chat: initialChat,
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

// Fetch all restaurants (with pagination, search, and owner email) - restricted to admin
export const getAllRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query; // Default values
    const skip = (page - 1) * limit;

    // **Get the list of owner UIDs if search query is provided**
    let ownerIds = [];
    if (search) {
      const users = await User.find(
        { email: { $regex: search, $options: "i" } }, // Match emails case-insensitively
        "uid" // Only return the uid of the matching users
      );
      ownerIds = users.map((user) => user.uid); // Extract the list of user UIDs
    }

    // **Create query for search** (search by name, location, or owner email)
    const restaurantQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } }, // Case-insensitive search on restaurant name
            { location: { $regex: search, $options: "i" } }, // Case-insensitive search on restaurant location
            { restaurantOwnerId: { $in: ownerIds } }, // Include owner UID from search by email
          ],
        }
      : {};

    // **Find total number of matching restaurants**
    const totalRestaurants = await Restaurant.countDocuments(restaurantQuery);

    // **Fetch restaurants matching the query (with pagination)**
    const restaurants = await Restaurant.find(restaurantQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("menu")
      .populate("chats");

    // **Get all the restaurant owners' UIDs**
    const allOwnerIds = restaurants.map(
      (restaurant) => restaurant.restaurantOwnerId
    );

    // **Get the owner emails for each restaurant's ownerId**
    const owners = await User.find({ uid: { $in: allOwnerIds } }, "uid email");

    // **Map the owner emails to each owner UID**
    const ownerEmailMap = owners.reduce((acc, owner) => {
      acc[owner.uid] = owner.email;
      return acc;
    }, {});

    // **Get dashboard information for each restaurant's ownerId**
    const dashboards = await Dashboard.find(
      { dashboardOwnerId: { $in: allOwnerIds } },
      "_id dashboardOwnerId"
    );

    // **Map the dashboards to their owner UID**
    const dashboardMap = dashboards.reduce((acc, dashboard) => {
      acc[dashboard.dashboardOwnerId] = dashboard._id;
      return acc;
    }, {});

    // **Attach owner email and dashboard info to each restaurant**
    const restaurantsWithOwners = restaurants.map((restaurant) => ({
      ...restaurant.toObject(),
      ownerEmail:
        ownerEmailMap[restaurant.restaurantOwnerId] || "Owner not found",
      dashboardId: dashboardMap[restaurant.restaurantOwnerId] || null,
    }));

    // **Return the paginated response**
    res.status(200).json({
      totalRestaurants,
      totalPages: Math.ceil(totalRestaurants / limit),
      currentPage: parseInt(page),
      restaurants: restaurantsWithOwners,
    });
  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    next(errorHandler(500, "Failed to fetch restaurants"));
  }
};

// Update restaurant information by ID
export const updateRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { name, location, logo, menuLink, orderLink } = req.body;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return next(errorHandler(404, "Restaurant not found"));

    // Check for undefined instead of truthiness to allow empty strings
    if (typeof name !== "undefined") restaurant.name = name;
    if (typeof location !== "undefined") restaurant.location = location;
    if (typeof logo !== "undefined") restaurant.logo = logo;
    if (typeof menuLink !== "undefined") restaurant.menuLink = menuLink;
    if (typeof orderLink !== "undefined") restaurant.orderLink = orderLink;

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
    if (!restaurant) {
      return next(errorHandler(404, "Restaurant not found"));
    }

    // Fetch all chat IDs for this restaurant before deleting
    const chats = await Chat.find({ restaurantId: restaurant._id }, { _id: 1 }); // only fetch _id
    const chatIds = chats.map((chat) => chat._id);

    // Remove these chatIds from starredChats of users
    if (chatIds.length > 0) {
      await User.updateMany(
        { starredChats: { $in: chatIds } },
        { $pull: { starredChats: { $in: chatIds } } }
      );

      // Also remove these chatIds from UserChat documents
      await UserChats.updateMany(
        { chatIds: { $in: chatIds } },
        { $pull: { chatIds: { $in: chatIds } } }
      );
    }

    // Delete associated data
    await ChatBot.deleteMany({ restaurantId: restaurant._id });
    await Chat.deleteMany({ restaurantId: restaurant._id });
    await Menu.deleteMany({ restaurantId: restaurant._id });
    await RestaurantAnalytics.deleteOne({ restaurantId }); // Delete RestaurantAnalytics

    // **Update related user records**
    const usersWithAccess = await User.find(
      { accessibleRestaurants: restaurant._id.toString() },
      { uid: 1, accessibleRestaurants: 1, roles: 1 }
    );

    // **Update accessibleRestaurants for users**
    await User.updateMany(
      { accessibleRestaurants: restaurant._id.toString() },
      { $pull: { accessibleRestaurants: restaurant._id.toString() } }
    );

    // **Check if the user has any accessibleRestaurants left**
    for (const user of usersWithAccess) {
      const updatedUser = await User.findOne({ uid: user.uid });

      if (updatedUser && updatedUser.accessibleRestaurants.length === 0) {
        // **If no more accessible restaurants, remove "restaurant admin" role**
        if (updatedUser.roles.includes("restaurant admin")) {
          await User.updateOne(
            { uid: user.uid },
            { $pull: { roles: "restaurant admin" } }
          );
        }
      }
    }

    // **Update dashboard records**

    await Dashboard.updateMany(
      { restaurants: restaurant._id },
      { $pull: { restaurants: restaurant._id } }
    );

    // Delete the restaurant
    await restaurant.deleteOne();

    res
      .status(200)
      .json({ message: "Restaurant and associated data deleted successfully" });
  } catch (error) {
    console.error(`Error deleting restaurant: ${error.message}`);
    next(errorHandler(500, "Failed to delete restaurant"));
  }
};

export const transferOwnership = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { newOwnerEmail } = req.body;

  try {
    // Fetch restaurant, new owner, and current owner
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return next(errorHandler(404, "Restaurant not found"));

    const newOwner = await User.findOne({ email: newOwnerEmail });
    if (!newOwner) return next(errorHandler(404, "New owner not found"));

    const currentOwner = await User.findOne({
      uid: restaurant.restaurantOwnerId,
    });
    if (!currentOwner)
      return next(errorHandler(404, "Current owner not found"));

    // Check if the new owner has a dashboard
    let newOwnerDashboard = await Dashboard.findOne({
      dashboardOwnerId: newOwner.uid,
    });

    //! If no dashboard exists, create one for the new owner.
    // Note we do this instead of calling endpoint for smoother customer experience
    // If we use the endpoint we need to ask user to give us their firebase token
    // Or alternatively create dashboards when user signs in (will also include non-admins)
    if (!newOwnerDashboard) {
      newOwnerDashboard = new Dashboard({
        dashboardOwnerId: newOwner.uid,
        restaurants: [],
        userAccess: [
          {
            userId: newOwner.uid,
            userEmail: newOwner.email,
            role: "restaurant main admin",
          },
        ],
      });

      await newOwnerDashboard.save();

      // Update the new owner's accessible dashboards
      newOwner.accessibleDashboards.push(newOwnerDashboard._id.toString());
      await newOwner.save();
    }

    // Update Restaurant Owner to new owner in Restaurant schema
    restaurant.restaurantOwnerId = newOwner.uid;

    // Update userAccess: Remove current owner, add new owner
    restaurant.userAccess = restaurant.userAccess.filter(
      (access) => access.userId !== currentOwner.uid
    );
    restaurant.userAccess.push({
      userId: newOwner.uid,
      userEmail: newOwner.email,
      role: "restaurant main admin",
    });

    await restaurant.save();

    // Update Dashboards
    await Dashboard.updateOne(
      { dashboardOwnerId: currentOwner.uid },
      { $pull: { restaurants: restaurantId } }
    );

    newOwnerDashboard.restaurants.push(restaurantId);
    await newOwnerDashboard.save();

    // Update Current Owner Accessible Restaurants
    currentOwner.accessibleRestaurants =
      currentOwner.accessibleRestaurants.filter((id) => id !== restaurantId);
    await currentOwner.save();

    newOwner.accessibleRestaurants.push(restaurantId);
    await newOwner.save();

    // Ensure newOwner has "restaurant main admin" role if not present
    if (!newOwner.roles.includes("restaurant main admin")) {
      newOwner.roles.push("restaurant main admin");
      await newOwner.save();
    }

    await currentOwner.save();

    res.status(200).json({
      message: "Ownership transferred successfully",
      restaurant,
      newOwnerEmail: newOwner.email,
    });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    next(errorHandler(500, "Failed to transfer ownership"));
  }
};
