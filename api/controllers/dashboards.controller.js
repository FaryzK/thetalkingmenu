import mongoose from "mongoose";
import Dashboard from "../models/dashboard.model.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { errorHandler } from "../utils/error.js";

export const createDashboard = async (req, res, next) => {
  const { uid } = req.user; // Use 'uid' from Firebase token, not 'userId'
  const { subscriptionId } = req.body;

  try {
    // Fetch the user and check role and dashboard association
    const user = await User.findOne({ uid }); // Use uid to find the user in your database
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check if user is a "restaurant main admin" (case-insensitive)
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

    // Check if the user already owns a dashboard
    const existingDashboard = await Dashboard.findOne({
      dashboardOwnerId: uid,
    });
    if (existingDashboard) {
      return next(errorHandler(400, "You already own a dashboard"));
    }

    // Check if the subscription plan exists, if not, use a default test plan
    const plan =
      (await Subscription.findById(subscriptionId)) ||
      (await Subscription.findOne({ name: "Test" }));
    if (!plan) {
      return next(errorHandler(400, "No subscription plan found"));
    }

    // Create the dashboard
    const newDashboard = new Dashboard({
      dashboardId: new mongoose.Types.ObjectId().toString(),
      dashboardOwnerId: uid, // Store the Firebase userId (uid)
      restaurants: [],
      subscriptionId: plan._id,
      employees: [],
    });

    await newDashboard.save();

    res.status(201).json({
      message: "Dashboard created successfully",
      dashboard: newDashboard,
    });
  } catch (error) {
    console.error("Error creating dashboard:", error); // Log the error
    next(errorHandler(500, "Server error"));
  }
};
