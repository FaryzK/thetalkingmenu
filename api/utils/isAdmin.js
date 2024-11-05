// isAdmin.js
import User from "../models/user.model.js";
import { errorHandler } from "./error.js";

// Middleware to check if the user is an admin
export const isAdmin = async (req, res, next) => {
  try {
    // Find user by UID in MongoDB
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check if user has the "the talking menu admin" role
    if (user.roles.includes("the talking menu admin")) {
      req.user = user; // Attach the full user document to req.user if needed
      return next();
    }

    return next(errorHandler(403, "Access denied. Admins only."));
  } catch (error) {
    return next(errorHandler(500, "Error checking admin access"));
  }
};
