import mongoose from "mongoose";

const tokenUsageSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  dashboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dashboard",
    required: true,
  },
  customerSubscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerSubscription",
    required: true,
  },
  month: {
    type: Number, // e.g., 1 for January, 2 for February, etc.
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  tokenUsageDetails: {
    prompt_tokens: {
      type: Number,
      default: 0,
    },
    completion_tokens: {
      type: Number,
      default: 0,
    },
    total_tokens: {
      type: Number,
      default: 0,
    },
  },
});

const TokenUsage = mongoose.model("TokenUsage", tokenUsageSchema);
export default TokenUsage;
