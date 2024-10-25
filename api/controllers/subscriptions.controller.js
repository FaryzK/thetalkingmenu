import Subscription from "../models/subscription.model.js";
import { errorHandler } from "../utils/error.js";

// Fetch all subscriptions
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json(subscriptions);
  } catch (error) {
    next(errorHandler(500, "Failed to fetch subscriptions"));
  }
};

// Create a new subscription
export const createSubscription = async (req, res, next) => {
  let { name, tokenLimitPerMonth, price } = req.body;

  // Standardize name to lowercase to match schema enum values
  name = name.toLowerCase();

  try {
    const newSubscription = new Subscription({
      name,
      tokenLimitPerMonth,
      price,
    });

    const savedSubscription = await newSubscription.save();
    res.status(201).json(savedSubscription);
  } catch (error) {
    console.error("Error saving subscription:", error);
    next(errorHandler(500, "Failed to create subscription"));
  }
};

// Update a subscription by ID
export const updateSubscription = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updatedSubscription) {
      return next(errorHandler(404, "Subscription not found"));
    }
    res.status(200).json(updatedSubscription);
  } catch (error) {
    next(errorHandler(500, "Failed to update subscription"));
  }
};

// Delete a subscription by ID
export const deleteSubscription = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(id);
    if (!deletedSubscription) {
      return next(errorHandler(404, "Subscription not found"));
    }
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Failed to delete subscription"));
  }
};
