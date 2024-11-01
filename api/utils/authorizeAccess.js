// utils/authorization.js
import Dashboard from "../models/dashboard.model.js";
import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "./error.js";

export const authorizeAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.uid; // Assumes req.user is set by `isAuthenticated` middleware
      const resourceId = req.params[`${resourceType}Id`]; // e.g., dashboardId, restaurantId
      const user = await User.findOne({ uid: userId });

      if (!user) {
        return next(errorHandler(404, "User not found"));
      }

      // Universal access for "talking menu admin"
      if (user.roles.includes("the talking menu admin")) {
        return next();
      }

      if (resourceType === "dashboard") {
        const dashboard = await Dashboard.findById(resourceId);
        if (!dashboard) {
          return next(errorHandler(404, "Dashboard not found"));
        }

        // Check if user is the dashboard owner
        if (dashboard.dashboardOwnerId === userId) {
          return next();
        }
      } else if (resourceType === "restaurant") {
        const restaurant = await Restaurant.findById(resourceId).populate(
          "employeesWithAccess"
        );
        if (!restaurant) {
          return next(errorHandler(404, "Restaurant not found"));
        }

        // Check if user is the restaurant owner
        if (restaurant.restaurantOwnerId === userId) {
          return next();
        }

        // Check if user is in the list of employees with access
        const isEmployeeWithAccess = restaurant.employeesWithAccess.some(
          (employee) => employee.uid === userId
        );

        if (isEmployeeWithAccess) {
          return next();
        }
      }

      // If none of the above conditions are met, deny access
      return next(errorHandler(403, "Access denied: insufficient permissions"));
    } catch (error) {
      next(error);
    }
  };
};
