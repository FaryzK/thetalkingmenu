import SubscriptionPackage from "../models/subscriptionPackage.model.js";
import { errorHandler } from "../utils/error.js";

// Fetch all subscriptions
export const getAllSubscriptionPackages = async (req, res, next) => {
  try {
    const subscriptionPackages = await SubscriptionPackage.find();
    res.status(200).json(subscriptionPackages);
  } catch (error) {
    next(errorHandler(500, "Failed to fetch subscription packages"));
  }
};

// Create a new subscription
export const createSubscriptionPackage = async (req, res, next) => {
  let { name, tokenLimitPerMonth, price, paymentSchedule } = req.body;

  // Standardize name to lowercase to match schema enum values
  name = name.toLowerCase();
  paymentSchedule = paymentSchedule?.toLowerCase() || "monthly"; // Default to "monthly" if not provided

  try {
    const newSubscriptionPackage = new SubscriptionPackage({
      name,
      tokenLimitPerMonth,
      price,
      paymentSchedule,
    });

    const savedSubscriptionPackage = await newSubscriptionPackage.save();
    res.status(201).json(savedSubscriptionPackage);
  } catch (error) {
    console.error("Error saving subscription package:", error);
    next(errorHandler(500, "Failed to create subscription package"));
  }
};

// Update a subscription by ID
export const updateSubscriptionPackage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedSubscriptionPackage =
      await SubscriptionPackage.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true }
      );
    if (!updatedSubscriptionPackage) {
      return next(errorHandler(404, "Subscription package not found"));
    }
    res.status(200).json(updatedSubscriptionPackage);
  } catch (error) {
    next(errorHandler(500, "Failed to update subscription package"));
  }
};

// Delete a subscription by ID
export const deleteSubscriptionPackage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedSubscriptionPackage =
      await SubscriptionPackage.findByIdAndDelete(id);
    if (!deletedSubscriptionPackage) {
      return next(errorHandler(404, "Subscription package not found"));
    }
    res
      .status(200)
      .json({ message: "Subscription package deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Failed to delete subscription package"));
  }
};
