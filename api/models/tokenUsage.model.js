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
  month: {
    type: Number, // e.g., 1 for January, 2 for February, etc.
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
  tokenLimit: {
    type: Number,
    required: true, // Capture the limit at the start of each month
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
    prompt_tokens_details: {
      cached_tokens: {
        type: Number,
        default: 0,
      },
      audio_tokens: {
        type: Number,
        default: 0,
      },
    },
    completion_tokens_details: {
      reasoning_tokens: {
        type: Number,
        default: 0,
      },
      audio_tokens: {
        type: Number,
        default: 0,
      },
      accepted_prediction_tokens: {
        type: Number,
        default: 0,
      },
      rejected_prediction_tokens: {
        type: Number,
        default: 0,
      },
    },
  },
});

const TokenUsage = mongoose.model("TokenUsage", tokenUsageSchema);
export default TokenUsage;
