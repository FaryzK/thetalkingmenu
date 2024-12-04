import RestaurantAnalytics from "../models/restaurantAnalytics.model.js";
import { errorHandler } from "../utils/error.js";

// Helper function to fill missing months with default values
const fillMissingMonths = (monthlyStats, currentYear, currentMonth) => {
  const filledStats = [];
  const statsMap = new Map(
    monthlyStats.map((stat) => [`${stat.year}-${stat.month}`, stat])
  );

  // Get the first valid year and month from the stats
  const firstStat = monthlyStats[monthlyStats.length - 1];
  if (!firstStat) {
    // No data exists, return an empty array
    return [];
  }
  const firstYear = firstStat.year;
  const firstMonth = firstStat.month;

  // Start filling from the first valid month up to the current month
  let current = new Date(firstYear, firstMonth - 1);
  const end = new Date(currentYear, currentMonth - 1);

  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1; // JavaScript months are 0-based

    const key = `${year}-${month}`;
    if (statsMap.has(key)) {
      filledStats.push(statsMap.get(key));
    } else {
      filledStats.push({
        year,
        month,
        chats: 0,
        messages: 0,
        total_tokens: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
      });
    }

    // Move to the next month
    current.setMonth(current.getMonth() + 1);
  }

  return filledStats;
};

// Controller: Get restaurant analytics
export const getRestaurantAnalytics = async (req, res, next) => {
  const { restaurantId } = req.params;

  try {
    // Fetch analytics for the given restaurant ID
    const analytics = await RestaurantAnalytics.findOne({ restaurantId });
    if (!analytics) {
      return next(errorHandler(404, "Analytics data not found"));
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Fill gaps in monthlyStats
    let filledMonthlyStats = fillMissingMonths(
      analytics.monthlyStats,
      currentYear,
      currentMonth
    );

    // Reverse the order so the most recent month appears first
    filledMonthlyStats = filledMonthlyStats.reverse();

    // Respond with analytics including reversed monthlyStats
    res.status(200).json({
      ...analytics.toObject(),
      monthlyStats: filledMonthlyStats,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return next(errorHandler(500, "Failed to fetch analytics"));
  }
};
