import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  userId: {
    type: String,
    required: true,
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
        enum: ["user", "assistant"], // differentiate messages
        required: true,
      },
    },
  ],
  tokensUsed: {
    type: Number,
    default: 0,
  },
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
