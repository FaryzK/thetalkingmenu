import RestaurantAnalytics from "../models/restaurantAnalytics.model.js";
import { errorHandler } from "../utils/error.js";

// Controller: Get restaurant analytics
export const getRestaurantAnalytics = async (req, res, next) => {
  const { restaurantId } = req.params;

  try {
    const analytics = await RestaurantAnalytics.findOne({ restaurantId });
    if (!analytics) {
      return next(errorHandler(404, "Analytics data not found"));
    }
    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return next(errorHandler(500, "Failed to fetch analytics"));
  }
};
