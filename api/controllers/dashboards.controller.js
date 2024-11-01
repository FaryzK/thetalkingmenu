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

    if (
      !user.roles.some((role) => role.toLowerCase() === "restaurant main admin")
    ) {
      return next(
        errorHandler(
          403,
          "You do not have the required role to create a dashboard"
        )
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

    const newDashboard = new Dashboard({
      dashboardOwnerId: uid,
      restaurants: [],
      subscriptionId: plan._id,
      restaurantAdmins: [], // using correct field name here
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

    // Fetch dashboards where the user is the owner or a restaurant admin
    const dashboards = await Dashboard.find({
      $or: [{ dashboardOwnerId: uid }, { restaurantAdmins: uid }],
    })
      .populate(
        "subscriptionId",
        "name tokenLimitPerMonth price paymentSchedule"
      )
      .populate("restaurants", "name location"); // Populate restaurants with name and location fields

    // Fetch usernames for dashboardOwnerId and restaurantAdmins
    const formattedDashboards = await Promise.all(
      dashboards.map(async (dashboard) => {
        const owner = await User.findOne(
          { uid: dashboard.dashboardOwnerId },
          "username"
        );
        const role =
          dashboard.dashboardOwnerId === uid
            ? "restaurant main admin"
            : "restaurant admin";

        return {
          _id: dashboard._id,
          dashboardOwnerName: owner ? owner.username : "Unknown",
          role,
          subscriptionId: dashboard.subscriptionId,
          restaurants: dashboard.restaurants.map((restaurant) => ({
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
