import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sessionToken: {
    type: String,
    required: true,
    index: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    index: true, // Index for optimized queries
  },
  tableNumber: { type: String, required: true, default: "default" },
  userId: {
    type: String,
    required: false, // Optional for anonymous users
  },
  messages: [
    {
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      sender: {
        type: String,
        enum: ["system", "user", "assistant"], // Removed extra space in "system "
        required: true,
      },
      role: {
        type: String,
        enum: ["system", "user", "assistant"],
      },
      index: {
        type: Number,
        default: 0,
      },
      finish_reason: {
        type: String,
      },
      logprobs: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
  ],
  model: {
    type: String,
  },
  tokenUsage: {
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
  seenBy: {
    type: [mongoose.Schema.Types.ObjectId], // Ensure it's always an array
    ref: "User",
    default: [], // Set an empty array as the default
  },
});

// Indexes for faster queries
chatSchema.index({ restaurantId: 1, "messages.timestamp": -1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
