import mongoose from "mongoose";

const restaurantAnalyticsSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    unique: true, // Ensure one data entry per restaurant
  },
  monthlyStats: [
    {
      year: Number,
      month: Number,
      chats: { type: Number, default: 0 },
      messages: { type: Number, default: 0 },
      total_tokens: { type: Number, default: 0 },
      prompt_tokens: { type: Number, default: 0 },
      completion_tokens: { type: Number, default: 0 },
    },
  ],
  totalChats: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  total_tokens: { type: Number, default: 0 },
  total_prompt_tokens: { type: Number, default: 0 },
  total_completion_tokens: { type: Number, default: 0 },
});

const RestaurantAnalytics = mongoose.model(
  "RestaurantAnalytic",
  restaurantAnalyticsSchema
);

export default RestaurantAnalytics;
