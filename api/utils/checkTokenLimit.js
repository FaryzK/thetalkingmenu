import TokenUsage from "../models/tokenUsage.model.js";
import Dashboard from "../models/dashboard.model.js";

// Helper function to check token limit
export const checkTokenLimitUsage = async (restaurantId) => {
  // Get the current date for month and year
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Retrieve the dashboard and customer subscription
  const dashboard = await Dashboard.findOne({
    restaurants: restaurantId,
  }).populate({
    path: "customerSubscriptionId",
    populate: { path: "subscriptionPackageId" },
  });

  if (!dashboard || !dashboard.customerSubscriptionId) {
    throw new Error("Dashboard or customer subscription not found");
  }

  const customerSubscription = dashboard.customerSubscriptionId;
  const tokenLimit =
    customerSubscription.subscriptionPackageId.tokenLimitPerMonth;

  // Retrieve or initialize token usage for the current month
  let tokenUsage = await TokenUsage.findOne({
    restaurantId,
    dashboardId: dashboard._id,
    customerSubscriptionId: customerSubscription._id,
    month,
    year,
  });

  if (!tokenUsage) {
    // Create a new TokenUsage document for the current month if it doesn't exist
    tokenUsage = new TokenUsage({
      restaurantId,
      dashboardId: dashboard._id,
      customerSubscriptionId: customerSubscription._id,
      month,
      year,
      tokensUsed: 0,
      tokenLimit,
    });
    await tokenUsage.save();
  }

  // Return an object indicating if the token limit is exceeded and the token usage details
  return {
    isLimitReached: tokenUsage.tokenUsageDetails.total_tokens >= tokenLimit,
    tokenUsage,
  };
};
