// controllers/employeeAccess.controller.js
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Dashboard from "../models/dashboard.model.js";
import { errorHandler } from "../utils/error.js";

// Add Employee Access
export const addEmployeeAccess = async (req, res, next) => {
  const { email, role, dashboardId, restaurantId } = req.body;

  try {
    // Step 1: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        errorHandler(
          404,
          "Email not found in the database. Please ask employee to sign up."
        )
      );
    }

    // Step 2: Update restaurant's userAccess field
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return next(errorHandler(404, "Restaurant not found"));
    }

    // Check if the employee already has access to the restaurant
    const isEmployeeInRestaurant = restaurant.userAccess.some(
      (emp) => emp.userId === user.uid
    );

    if (!isEmployeeInRestaurant) {
      restaurant.userAccess.push({
        userId: user.uid,
        userEmail: user.email,
        role: role,
      });
      await restaurant.save();
    }

    // Step 3: Update dashboard's userAccess field
    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      return next(errorHandler(404, "Dashboard not found"));
    }

    // Check if the employee already has access to the dashboard
    const isEmployeeInDashboard = dashboard.userAccess.some(
      (emp) => emp.userId === user.uid
    );

    if (!isEmployeeInDashboard) {
      dashboard.userAccess.push({
        userId: user.uid,
        userEmail: user.email,
        role: role,
      });
      await dashboard.save();
    }

    // Step 4: Update user's accessibleDashboards and accessibleRestaurants fields
    if (!user.accessibleDashboards.includes(dashboardId)) {
      user.accessibleDashboards.push(dashboardId);
    }
    if (!user.accessibleRestaurants.includes(restaurantId)) {
      user.accessibleRestaurants.push(restaurantId);
    }

    // Step 5: Add role to user's roles if not already assigned
    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }

    await user.save();

    res.status(200).json({
      message: "Employee access added successfully",
      accessibleDashboards: user.accessibleDashboards,
      accessibleRestaurants: user.accessibleRestaurants,
      employee: { userId: user.uid, userEmail: user.email, role: role },
    });
  } catch (error) {
    console.error("Error adding employee access:", error);
    next(errorHandler(500, "Failed to add employee access"));
  }
};

// employeeAccess.controller.js
export const revokeEmployeeAccess = async (req, res, next) => {
  const { userId, dashboardId, restaurantId } = req.body;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return next(errorHandler(404, "Restaurant not found"));

    restaurant.userAccess = restaurant.userAccess.filter(
      (emp) => emp.userId !== userId
    );
    await restaurant.save();

    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) return next(errorHandler(404, "Dashboard not found"));

    dashboard.userAccess = dashboard.userAccess.filter(
      (emp) => emp.userId !== userId
    );
    await dashboard.save();

    const user = await User.findOne({ uid: userId });
    if (user) {
      user.accessibleDashboards = user.accessibleDashboards.filter(
        (id) => id !== dashboardId
      );
      user.accessibleRestaurants = user.accessibleRestaurants.filter(
        (id) => id !== restaurantId
      );
      await user.save();
    }

    res.status(200).json({
      message: "Employee access revoked successfully",
      accessibleDashboards: user?.accessibleDashboards || [],
      accessibleRestaurants: user?.accessibleRestaurants || [],
    });
  } catch (error) {
    console.error("Error revoking employee access:", error);
    next(errorHandler(500, "Failed to revoke employee access"));
  }
};
