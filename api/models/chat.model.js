import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  userId: {
    type: String,
    required: false, // Make this field optional
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
        enum: ["system ", "user", "assistant"],
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
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
