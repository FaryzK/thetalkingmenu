import mongoose from "mongoose";
import Dashboard from "../models/dashboard.model.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { errorHandler } from "../utils/error.js";

// createDashboard controller
export const createDashboard = async (req, res, next) => {
  const { uid } = req.user;
  const { subscriptionId } = req.body;

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (!user.roles.includes("restaurant main admin")) {
      return next(
        errorHandler(403, "You do not have permission to create a dashboard")
      );
    }

    const existingDashboard = await Dashboard.findOne({
      dashboardOwnerId: uid,
    });
    if (existingDashboard) {
      return next(errorHandler(400, "You already own a dashboard"));
    }

    const plan = subscriptionId
      ? await Subscription.findById(subscriptionId)
      : await Subscription.findOne({ name: "test" });

    if (!plan) {
      return next(errorHandler(400, "No subscription plan found"));
    }

    // Create new dashboard
    const newDashboard = new Dashboard({
      dashboardOwnerId: uid,
      restaurants: [],
      subscriptionId: plan._id,
      userAccess: [
        {
          userId: user.uid,
          userEmail: user.email,
          role: "restaurant main admin",
        },
      ],
    });

    await newDashboard.save();

    // Add the new dashboard ID to the user's accessibleDashboards
    user.accessibleDashboards.push(newDashboard._id.toString());
    await user.save();

    res.status(201).json({
      message: "Dashboard created successfully",
      dashboard: newDashboard,
      accessibleDashboards: user.accessibleDashboards,
    });
  } catch (error) {
    console.error("Error creating dashboard:", error);
    next(errorHandler(500, "Server error"));
  }
};

// getDashboards controller
export const getDashboards = async (req, res, next) => {
  try {
    const { uid } = req.user;

    // Fetch dashboards where the user is either the owner or an employee with access
    const dashboards = await Dashboard.find({
      $or: [{ dashboardOwnerId: uid }, { "userAccess.userId": uid }],
    })
      .populate(
        "subscriptionId",
        "name tokenLimitPerMonth price paymentSchedule"
      )
      .populate({
        path: "restaurants",
        select: "name location userAccess",
      });

    // Format response with filtered restaurants based on user access
    const formattedDashboards = await Promise.all(
      dashboards.map(async (dashboard) => {
        const isMainAdmin = dashboard.dashboardOwnerId === uid;
        const role = isMainAdmin ? "Restaurant Main Admin" : "Restaurant Admin";

        // Fetch the dashboard owner's email
        const owner = await User.findOne({ uid: dashboard.dashboardOwnerId });
        const dashboardOwnerEmail = owner ? owner.email : "Unknown";

        // Filter restaurants: Main Admin sees all, invited Admin sees only assigned restaurants
        const accessibleRestaurants = isMainAdmin
          ? dashboard.restaurants // Main Admin can see all restaurants
          : dashboard.restaurants.filter((restaurant) =>
              restaurant.userAccess.some((emp) => emp.userId === uid)
            );

        return {
          _id: dashboard._id,
          dashboardOwnerEmail, // Now showing the actual owner email
          role,
          subscriptionId: dashboard.subscriptionId,
          userAccess: dashboard.userAccess,
          restaurants: accessibleRestaurants.map((restaurant) => ({
            _id: restaurant._id,
            name: restaurant.name,
            location: restaurant.location,
          })),
        };
      })
    );

    res.status(200).json({ dashboards: formattedDashboards });
  } catch (error) {
    console.error("Error fetching dashboards:", error);
    next(errorHandler(500, "Failed to fetch dashboards"));
  }
};